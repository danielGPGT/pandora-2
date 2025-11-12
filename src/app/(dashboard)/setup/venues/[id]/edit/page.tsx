import { Suspense } from 'react'
import { DetailsPageLayout } from '@/components/reusable/details-page-layout'
import { PageLoading } from '@/components/shared/page-loading'
import { VenueEditWrapper } from '@/components/setup/venues/venue-edit-wrapper'
import { ErrorBoundary } from '@/components/shared/error-boundary'

export default function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ErrorBoundary>
      <DetailsPageLayout
        title="Edit Venue"
        subtitle="Update venue details"
        backHref="/setup/venues"
      >
        <Suspense fallback={<PageLoading />}>
          <VenueEditWrapper params={params} />
        </Suspense>
      </DetailsPageLayout>
    </ErrorBoundary>
  )
}

