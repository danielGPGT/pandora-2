import { Suspense } from 'react'
import { GeneralPageLayout } from '@/components/reusable/general-page-layout'
import { PageLoading } from '@/components/shared/page-loading'
import { SportsTable } from '@/components/setup/sports/sports-table'
import { CreateSportDialog } from '@/components/setup/sports/create-sport-dialog'
import { ErrorBoundary } from '@/components/shared/error-boundary'

export default function SportsPage() {
  return (
    <ErrorBoundary>
      <GeneralPageLayout
        title="Sports"
        subtitle="Manage sports for your events"
        actions={<CreateSportDialog />}
      >
        <Suspense fallback={<PageLoading />}>
          <SportsTable />
        </Suspense>
      </GeneralPageLayout>
    </ErrorBoundary>
  )
}

