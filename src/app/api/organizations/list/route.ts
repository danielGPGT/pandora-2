import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role client to bypass RLS for now
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

    // Get the organization memberships
    const { data: memberships, error: membersError } = await serviceClient
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)

    if (membersError) {
      return NextResponse.json(
        { error: membersError.message },
        { status: 400 }
      )
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ organizations: [] })
    }

    // Get the organization details
    const orgIds = memberships.map(m => m.organization_id)
    const { data: orgs, error: orgsError } = await serviceClient
      .from('tenants')
      .select('id, name, slug, logo_url, default_currency, subscription_plan, subscription_status')
      .in('id', orgIds)

    if (orgsError) {
      return NextResponse.json(
        { error: orgsError.message },
        { status: 400 }
      )
    }

    // Combine the data
    const organizations = memberships.map(membership => ({
      role: membership.role,
      organization: orgs?.find(org => org.id === membership.organization_id),
    })).filter(item => item.organization) // Filter out any null organizations

    return NextResponse.json({ organizations })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

