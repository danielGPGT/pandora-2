'use client'

import { useVenue, useVenues } from '@/lib/hooks/use-venues'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditLog } from '@/components/shared/audit-log'
import { PageLoading } from '@/components/shared/page-loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InlineEditField } from '@/components/shared/inline-edit-field'
import { InlineEditTextarea } from '@/components/shared/inline-edit-textarea'
import { InlineEditSelect } from '@/components/shared/inline-edit-select'
import { useCountries } from '@/lib/hooks/use-countries'
import { DetailsContent, DetailValue, DetailImage, DetailBadge, DetailCode, DetailDate } from '@/components/reusable/details-content'
import { Info, MapPin, Building2, Globe, Users, Clock, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export function VenueDetails({ id }: { id: string }) {
  const { venue, isLoading } = useVenue(id)
  const { updateVenue } = useVenues()
  const { data: countries = [] } = useCountries()

  const handleFieldUpdate = async (field: string, value: any) => {
    if (!venue) return
    try {
      await updateVenue({ id: venue.id, [field]: value } as any)
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to update venue:', error)
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  if (!venue) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Venue not found</p>
        </CardContent>
      </Card>
    )
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
              description: "Core venue details",
              icon: Info,
              fields: [
                {
                  label: "Name",
                  value: (
                    <InlineEditField
                      value={venue.name}
                      onSave={(value) => handleFieldUpdate('name', value)}
                      displayClassName="text-sm font-semibold"
                    />
                  ),
                },
                {
                  label: "Slug",
                  value: (
                    <InlineEditField
                      value={venue.slug}
                      onSave={(value) => handleFieldUpdate('slug', value)}
                      displayClassName="text-xs"
                    />
                  ),
                },
                {
                  label: "Venue Type",
                  value: (
                    <InlineEditSelect
                      value={venue.venue_type || ''}
                      onSave={(value) => handleFieldUpdate('venue_type', value || undefined)}
                      options={[
                        { value: 'stadium', label: 'Stadium' },
                        { value: 'arena', label: 'Arena' },
                        { value: 'track', label: 'Track' },
                        { value: 'circuit', label: 'Circuit' },
                        { value: 'course', label: 'Course' },
                        { value: 'other', label: 'Other' },
                      ]}
                      placeholder="Select venue type"
                      emptyLabel="Not set"
                    />
                  ),
                },
                {
                  label: "Description",
                  value: (
                    <InlineEditTextarea
                      value={venue.description || ''}
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
              title: "Location",
              description: "Venue location details",
              icon: MapPin,
              fields: [
                {
                  label: "City",
                  value: venue.city ? (
                    <InlineEditField
                      value={venue.city}
                      onSave={(value) => handleFieldUpdate('city', value)}
                      displayClassName="text-sm"
                    />
                  ) : (
                    <DetailValue value={null} emptyText="Not set" />
                  ),
                },
                {
                  label: "Country",
                  value: (
                    <InlineEditSelect
                      value={venue.country_code || ''}
                      onSave={(value) => handleFieldUpdate('country_code', value || undefined)}
                      options={countries.map((country) => ({
                        value: country.code,
                        label: `${country.name} (${country.code})`,
                      }))}
                      placeholder="Select country"
                      emptyLabel="Not set"
                    />
                  ),
                },
                {
                  label: "Latitude",
                  value: (
                    <InlineEditField
                      value={venue.latitude ?? ''}
                      onSave={(value) => handleFieldUpdate('latitude', value ? Number(value) : undefined)}
                      type="number"
                      placeholder="e.g., 51.5560"
                      displayClassName="text-xs font-mono"
                    />
                  ),
                },
                {
                  label: "Longitude",
                  value: (
                    <InlineEditField
                      value={venue.longitude ?? ''}
                      onSave={(value) => handleFieldUpdate('longitude', value ? Number(value) : undefined)}
                      type="number"
                      placeholder="e.g., -0.2795"
                      displayClassName="text-xs font-mono"
                    />
                  ),
                },
                {
                  label: "Timezone",
                  value: venue.timezone ? (
                    <InlineEditField
                      value={venue.timezone}
                      onSave={(value) => handleFieldUpdate('timezone', value)}
                      displayClassName="text-sm"
                    />
                  ) : (
                    <DetailValue value={null} emptyText="Not set" />
                  ),
                },
              ],
            },
            {
              title: "Capacity & Details",
              description: "Venue capacity and additional information",
              icon: Building2,
              fields: [
                {
                  label: "Capacity",
                  value: (
                    <InlineEditField
                      value={venue.capacity ?? ''}
                      onSave={(value) => handleFieldUpdate('capacity', value ? Number(value) : undefined)}
                      type="number"
                      placeholder="e.g., 90000"
                      displayClassName="text-sm font-medium"
                    />
                  ),
                },
              ],
            },
            {
              title: "Images",
              description: "Venue images",
              icon: ImageIcon,
              fields: [
                {
                  label: "Images",
                  value: venue.images && venue.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {venue.images.map((imageUrl, index) => (
                        <div key={index} className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                          <Image
                            src={imageUrl}
                            alt={`${venue.name} image ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <DetailValue value={null} emptyText="No images uploaded" />
                  ),
                  span: 2,
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
            <AuditLog entityType="venue" entityId={id} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

