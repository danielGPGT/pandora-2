'use client'

import { useOrganization } from '@/lib/hooks/use-organization'
import { GeneralPageLayout } from '@/components/reusable/general-page-layout'

export default function DashboardPage() {
  const { currentOrg } = useOrganization()

  return (
    <GeneralPageLayout
      title="Dashboard"
      subtitle={`Welcome to ${currentOrg?.name || 'your organization'}`}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Bookings</h3>
          <p className="mt-2 text-3xl font-bold">124</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
          <p className="mt-2 text-3xl font-bold">£456K</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Active Quotes</h3>
          <p className="mt-2 text-3xl font-bold">18</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Margin</h3>
          <p className="mt-2 text-3xl font-bold">32%</p>
        </div>
      </div>
    </GeneralPageLayout>
  )
}

