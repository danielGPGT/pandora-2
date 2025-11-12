import { DetailsPageLayout } from '@/components/reusable/details-page-layout'
import { SportForm } from '@/components/setup/sports/sport-form'

export default function NewSportPage() {
  return (
    <DetailsPageLayout
      title="Create Sport"
      subtitle="Add a new sport to your system"
      backHref="/setup/sports"
    >
      <div className="max-w-2xl">
        <SportForm />
      </div>
    </DetailsPageLayout>
  )
}

