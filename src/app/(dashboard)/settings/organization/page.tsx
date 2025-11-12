'use client'

import { useOrganization } from '@/lib/hooks/use-organization'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { InviteMemberDialog } from '@/components/organization/invite-member-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OrganizationSettingsPage() {
  const { currentOrg } = useOrganization()
  const { can } = usePermissions()

  if (!currentOrg) {
    return <div>No organization selected</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-gray-600">Manage your organization settings</p>
        </div>
        {can('members:manage') && <InviteMemberDialog />}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Basic information about your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-gray-600">{currentOrg.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <p className="text-sm text-gray-600">{currentOrg.slug}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Default Currency</label>
              <p className="text-sm text-gray-600">{currentOrg?.default_currency || 'GBP'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

