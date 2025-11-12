import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entity_type')
    const entityId = searchParams.get('entity_id')

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entity_type and entity_id are required' },
        { status: 400 }
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

    // Use service role to bypass RLS (already created above)
    const serviceClient = serviceClientForQuery

    // Get audit logs for the entity, filtered by tenant
    const { data, error } = await serviceClient
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('tenant_id', orgMember.organization_id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching audit logs:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Map to ActivityTimeline format
    // Convert action names: 'created' -> 'create', 'updated' -> 'update', etc.
    const actionMap: Record<string, string> = {
      'created': 'create',
      'updated': 'update',
      'deleted': 'delete',
      'duplicated': 'duplicate',
    }

    const logs = data.map((log: any) => ({
      id: log.id,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      action: actionMap[log.action] || log.action,
      old_values: log.old_values,
      new_values: log.new_values,
      changed_by: log.user_id,
      changed_at: log.created_at,
      changed_by_user: {
        id: log.user_id,
        email: null, // Will be populated if we add user lookup
        first_name: null,
        last_name: null,
      },
    }))

    return NextResponse.json({ logs })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

