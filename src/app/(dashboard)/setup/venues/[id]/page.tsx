import { Suspense } from 'react'
import { DetailsPageLayout } from '@/components/reusable/details-page-layout'
import { PageLoading } from '@/components/shared/page-loading'
import { VenueDetails } from '@/components/setup/venues/venue-details'
import { VenueDetailActions } from '@/components/setup/venues/venue-detail-actions'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Venue } from '@/types/venues'

export default async function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    notFound()
  }

  // Get current organization - use service role to bypass RLS
  let organizationId: string | null = null
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
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

    const { data: orgMembers } = await serviceClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)

    if (orgMembers && orgMembers.length > 0) {
      organizationId = orgMembers[0].organization_id
    }
  } else {
    // Fallback to regular client
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (orgMember) {
      organizationId = orgMember.organization_id
    }
  }

  if (!organizationId) {
    notFound()
  }

  // Fetch venue data server-side
  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', organizationId)
    .is('deleted_at', null)
    .single()

  if (error || !venue) {
    notFound()
  }

  return (
    <ErrorBoundary>
      <DetailsPageLayout
        title={`${venue.name} Details`}
        subtitle={venue.city ? `${venue.city}${venue.country_code ? `, ${venue.country_code}` : ''}` : undefined}
        backHref="/setup/venues"
        actions={<VenueDetailActions venueId={id} />}
      >
        <Suspense fallback={<PageLoading />}>
          <VenueDetails id={id} />
        </Suspense>
      </DetailsPageLayout>
    </ErrorBoundary>
  )
}

