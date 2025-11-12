import { DetailsPageLayout } from '@/components/reusable/details-page-layout'
import { VenueForm } from '@/components/setup/venues/venue-form'
import { ErrorBoundary } from '@/components/shared/error-boundary'

export default function NewVenuePage() {
  return (
    <ErrorBoundary>
      <DetailsPageLayout
        title="Create Venue"
        subtitle="Add a new venue to your system"
        backHref="/setup/venues"
      >
        <VenueForm />
      </DetailsPageLayout>
    </ErrorBoundary>
  )
}

