import { Suspense } from 'react'
import { DetailsPageLayout } from '@/components/reusable/details-page-layout'
import { PageLoading } from '@/components/shared/page-loading'
import { SportEditWrapper } from '@/components/setup/sports/sport-edit-wrapper'

export default async function EditSportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <DetailsPageLayout
      title="Edit Sport"
      backHref={`/setup/sports/${id}`}
    >
      <div className="max-w-2xl">
        <Suspense fallback={<PageLoading />}>
          <SportEditWrapper id={id} />
        </Suspense>
      </div>
    </DetailsPageLayout>
  )
}

