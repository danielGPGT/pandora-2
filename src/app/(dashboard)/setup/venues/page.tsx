import { Suspense } from 'react'
import { GeneralPageLayout } from '@/components/reusable/general-page-layout'
import { PageLoading } from '@/components/shared/page-loading'
import { VenuesTable } from '@/components/setup/venues/venues-table'
import { CreateVenueDialog } from '@/components/setup/venues/create-venue-dialog'
import { ErrorBoundary } from '@/components/shared/error-boundary'

export default function VenuesPage() {
  return (
    <ErrorBoundary>
      <GeneralPageLayout
        title="Venues"
        subtitle="Manage venues for your events"
        actions={<CreateVenueDialog />}
      >
        <Suspense fallback={<PageLoading />}>
          <VenuesTable />
        </Suspense>
      </GeneralPageLayout>
    </ErrorBoundary>
  )
}

