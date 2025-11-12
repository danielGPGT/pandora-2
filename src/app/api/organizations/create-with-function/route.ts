// Alternative implementation using database function
// This is more secure than using service role key
// Requires the create_organization_with_owner function to be created in Supabase

import { createClient } from '@/lib/supabase/server'
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

    // Call the database function
    const { data: orgId, error } = await supabase.rpc('create_organization_with_owner', {
      org_name: name,
      org_slug: slug,
      user_id: user.id,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Fetch the created organization
    const { data: org, error: fetchError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', orgId)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
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

