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

    const body = await request.json()
    const { name, slug } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Create organization
    const { data: org, error: orgError } = await serviceClient
      .from('tenants')
      .insert({
        name,
        slug,
        default_currency: 'GBP',
        subscription_plan: 'free',
        subscription_status: 'active',
      })
      .select()
      .single()

    if (orgError) {
      return NextResponse.json(
        { error: orgError.message },
        { status: 400 }
      )
    }

    // Add user as owner (bypassing RLS with service role)
    const { error: memberError } = await serviceClient
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      // Rollback: delete the organization if member creation fails
      await serviceClient
        .from('tenants')
        .delete()
        .eq('id', org.id)

      return NextResponse.json(
        { error: memberError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ organization: org })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

