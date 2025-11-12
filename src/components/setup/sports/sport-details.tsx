'use client'

import { useSport, useSports } from '@/lib/hooks/use-sports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { AuditLog } from '@/components/shared/audit-log'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InlineEditField } from '@/components/shared/inline-edit-field'
import { InlineEditTextarea } from '@/components/shared/inline-edit-textarea'
import { InlineEditSwitch } from '@/components/shared/inline-edit-switch'
import { InlineImageUpload } from '@/components/shared/inline-image-upload'
import { DetailsContent, DetailValue, DetailImage, DetailBadge, DetailCode } from '@/components/reusable/details-content'
import { Info, Image as ImageIcon } from 'lucide-react'

export function SportDetails({ id }: { id: string }) {
  const { sport, isLoading } = useSport(id)
  const { updateSport } = useSports()

  const handleFieldUpdate = async (field: string, value: any) => {
    if (!sport) return
    try {
      await updateSport({ id: sport.id, [field]: value } as any)
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to update sport:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!sport) {
    return <div>Sport not found</div>
  }

  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList className="h-9">
        <TabsTrigger value="details" className="text-sm">Details</TabsTrigger>
        <TabsTrigger value="activity" className="text-sm">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <DetailsContent
          sections={[
            {
              title: "Basic Information",
              description: "Core details and settings",
              icon: Info,
              fields: [
                {
                  label: "Name",
                  value: (
                    <InlineEditField
                      value={sport.name}
                      onSave={(value) => handleFieldUpdate('name', value)}
                      displayClassName="text-sm font-semibold"
                    />
                  ),
                },
                {
                  label: "Slug",
                  value: (
                    <InlineEditField
                      value={sport.slug}
                      onSave={(value) => handleFieldUpdate('slug', value)}
                      displayClassName="text-xs"
                    />
                  ),
                },
                {
                  label: "Status",
                  value: (
                    <DetailBadge>
                      <InlineEditSwitch
                        value={sport.is_active}
                        onSave={(value) => handleFieldUpdate('is_active', value)}
                      />
                      <StatusBadge isActive={sport.is_active} />
                    </DetailBadge>
                  ),
                },
                {
                  label: "Sort Order",
                  value: (
                    <InlineEditField
                      value={sport.sort_order}
                      onSave={(value) => handleFieldUpdate('sort_order', value)}
                      type="number"
                      displayClassName="text-sm"
                    />
                  ),
                },
                {
                  label: "Description",
                  value: (
                    <InlineEditTextarea
                      value={sport.description || ''}
                      onSave={(value) => handleFieldUpdate('description', value)}
                      placeholder="Add a description..."
                      displayClassName="text-xs"
                    />
                  ),
                  span: 2,
                },
              ],
            },
            {
              title: "Images",
              description: "Visual assets",
              icon: ImageIcon,
              fields: [
                {
                  label: "Icon",
                  value: (
                    <InlineImageUpload
                      value={sport.icon_url}
                      onChange={(url) => handleFieldUpdate('icon_url', url)}
                      folder="sports/icons"
                      label="Icon"
                      size="sm"
                      aspectRatio="square"
                    />
                  ),
                },
                {
                  label: "Featured Image",
                  value: (
                    <InlineImageUpload
                      value={sport.image_url}
                      onChange={(url) => handleFieldUpdate('image_url', url)}
                      folder="sports/images"
                      label="Featured Image"
                      size="md"
                      aspectRatio="wide"
                    />
                  ),
                },
              ],
            },
          ]}
          gridCols={2}
          variant="compact"
        />
      </TabsContent>

      <TabsContent value="activity">
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditLog entityType="sport" entityId={id} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

