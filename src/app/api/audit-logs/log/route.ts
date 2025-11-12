import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organization - use service role to bypass RLS
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      )
    }

    const serviceClientForQuery = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data: orgMembers, error: orgError } = await serviceClientForQuery
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)

    if (orgError || !orgMembers || orgMembers.length === 0) {
      console.error('Error fetching organization:', orgError)
      return NextResponse.json(
        { error: 'No organization found for user' },
        { status: 403 }
      )
    }

    const orgMember = orgMembers[0]

    const body = await request.json()
    const { entityType, entityId, action, oldValues, newValues } = body

    if (!entityType || !entityId || !action) {
      return NextResponse.json(
        { error: 'entityType, entityId, and action are required' },
        { status: 400 }
      )
    }

    // Use service role to bypass RLS (already created above)
    const serviceClient = serviceClientForQuery

    // Insert audit log
    const { data, error } = await serviceClient
      .from('audit_logs')
      .insert({
        tenant_id: orgMember.organization_id,
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        action,
        old_values: oldValues || null,
        new_values: newValues || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating audit log:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { 
          error: error.message || 'Failed to create audit log',
          details: error,
          code: error.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, log: data })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

