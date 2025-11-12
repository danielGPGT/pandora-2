'use client'

import { DataTable08 } from '@/components/reusable/data-tables/data-table'
import { useVenues } from '@/lib/hooks/use-venues'
import { ColumnDef } from '@tanstack/react-table'
import { Venue } from '@/types/venues'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Copy, Eye, Loader2, MapPin, Building2, Users, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'
import { DeleteDialog } from '@/components/shared/delete-dialog'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/shared/empty-state'
import * as api from '@/lib/api/venues'
import { useOrganization } from '@/lib/hooks/use-organization'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { EditVenueDialog } from './edit-venue-dialog'
import { Input } from '@/components/ui/input'
import { EntityCard } from '@/components/reusable/entity-card'
import { SummaryTile } from '@/components/reusable/summary-tile'
import { slugify } from '@/lib/utils/slug'

// Inline editable cells
function EditableNameCell({ row, onUpdate }: { row: any; onUpdate: (id: string, value: string) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false)
  const currentValue = row.getValue('name') as string
  const [value, setValue] = useState(currentValue)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setValue(currentValue)
  }, [currentValue])

  const handleSave = async () => {
    if (value === row.getValue('name')) {
      setIsEditing(false)
      return
    }
    if (!value.trim()) {
      setValue(currentValue)
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onUpdate(row.original.id, value.trim())
      setIsEditing(false)
    } catch (err) {
      setValue(currentValue)
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setValue(currentValue)
              setIsEditing(false)
            }
          }}
          autoFocus
          disabled={isSaving}
          className="h-8"
        />
      </div>
    )
  }

  return (
    <div onClick={() => setIsEditing(true)} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 min-h-[2rem]">
      <span className="font-medium">{value || '-'}</span>
    </div>
  )
}

function EditableSlugCell({ row, onUpdate }: { row: any; onUpdate: (id: string, value: string) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false)
  const currentValue = row.getValue('slug') as string
  const [value, setValue] = useState(currentValue)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setValue(currentValue)
  }, [currentValue])

  const handleSave = async () => {
    const slugified = slugify(value)
    if (slugified === currentValue) {
      setIsEditing(false)
      return
    }
    if (!slugified) {
      setValue(currentValue)
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onUpdate(row.original.id, slugified)
      setIsEditing(false)
    } catch (err) {
      setValue(currentValue)
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') {
            setValue(currentValue)
            setIsEditing(false)
          }
        }}
        autoFocus
        disabled={isSaving}
        className="h-8 font-mono text-xs"
      />
    )
  }

  return (
    <code onClick={() => setIsEditing(true)} className="text-xs bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80 transition-colors">
      {value || '-'}
    </code>
  )
}

function EditableCityCell({ row, onUpdate }: { row: any; onUpdate: (id: string, value: string) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false)
  const currentValue = row.getValue('city') as string
  const [value, setValue] = useState(currentValue || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setValue(currentValue || '')
  }, [currentValue])

  const handleSave = async () => {
    const trimmedValue = value.trim()
    if (trimmedValue === (currentValue || '')) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onUpdate(row.original.id, trimmedValue || '')
      setIsEditing(false)
    } catch (err) {
      setValue(currentValue || '')
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') {
            setValue(currentValue || '')
            setIsEditing(false)
          }
        }}
        autoFocus
        disabled={isSaving}
        className="h-8"
      />
    )
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 min-h-[2rem] flex items-center">
      {value || '-'}
    </div>
  )
}

export function VenuesTable() {
  const { venues, isLoading, deleteVenue, duplicateVenue, updateVenue } = useVenues()
  const { currentOrg } = useOrganization()
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Update handler for inline edits
  const handleFieldUpdate = (field: string) => async (id: string, value: any) => {
    try {
      // Handle empty strings for optional fields
      const updateValue = value === '' ? undefined : value
      await updateVenue({ id, [field]: updateValue } as any)
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to update venue:', error)
    }
  }

  // Card view renderer
  const renderVenueCard = (row: any) => {
    const venue = row.original as Venue
    return (
      <EntityCard
        id={venue.id}
        title={venue.name}
        subtitle={venue.city ? `${venue.city}${venue.country_code ? `, ${venue.country_code}` : ''}` : venue.slug}
        imageUrl={venue.images && venue.images.length > 0 ? venue.images[0] : undefined}
        imageAlt={venue.name}
        fields={[
          ...(venue.venue_type ? [{ label: 'Type', value: venue.venue_type }] : []),
          ...(venue.capacity ? [{ label: 'Capacity', value: venue.capacity.toLocaleString() }] : []),
          ...(venue.timezone ? [{ label: 'Timezone', value: venue.timezone }] : []),
          ...(venue.description
            ? [
                {
                  label: 'Description',
                  value: (
                    <p className="line-clamp-2 text-muted-foreground">
                      {venue.description}
                    </p>
                  ),
                },
              ]
            : []),
        ]}
        actions={[
          {
            label: 'Edit',
            icon: Edit,
            onClick: () => setEditId(venue.id),
          },
          {
            label: 'Duplicate',
            icon: Copy,
            onClick: () => duplicateVenue(venue.id),
          },
          {
            label: 'Delete',
            icon: Trash2,
            onClick: () => setDeleteId(venue.id),
            variant: 'destructive',
          },
        ]}
        viewHref={`/setup/venues/${venue.id}`}
        enableSelection={true}
        isSelected={row.getIsSelected()}
        onSelect={(id, selected) => row.toggleSelected(selected)}
      />
    )
  }

  const columns: ColumnDef<Venue>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <EditableNameCell row={row} onUpdate={handleFieldUpdate('name')} />,
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => <EditableSlugCell row={row} onUpdate={handleFieldUpdate('slug')} />,
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => <EditableCityCell row={row} onUpdate={handleFieldUpdate('city')} />,
    },
    {
      accessorKey: 'venue_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('venue_type') as string
        return type ? <span className="text-sm capitalize">{type}</span> : '-'
      },
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ row }) => {
        const capacity = row.getValue('capacity') as number
        return capacity ? <span className="text-sm">{capacity.toLocaleString()}</span> : '-'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/setup/venues/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditId(row.original.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateVenue(row.original.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(row.original.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!venues?.length) {
    return (
      <EmptyState
        icon={MapPin}
        title="No venues yet"
        description="Get started by creating your first venue"
        action={{
          label: 'Add Venue',
          onClick: () => {
            // This will be handled by the CreateVenueDialog in the page header
            router.push('/setup/venues')
          },
        }}
      />
    )
  }

  // Calculate metrics
  const totalVenues = venues?.length || 0
  const venuesWithLocation = venues?.filter((v) => v.city || v.country_code).length || 0
  const venuesWithCapacity = venues?.filter((v) => v.capacity).length || 0
  const venuesWithImages = venues?.filter((v) => v.images && v.images.length > 0).length || 0

  return (
    <>
      {/* Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryTile
          icon={<MapPin className="h-5 w-5" />}
          label="Total Venues"
          value={totalVenues}
          helper={totalVenues === 1 ? 'venue' : 'venues'}
        />
        <SummaryTile
          icon={<Globe className="h-5 w-5" />}
          label="With Location"
          value={venuesWithLocation}
          helper={`${totalVenues > 0 ? Math.round((venuesWithLocation / totalVenues) * 100) : 0}% have location`}
        />
        <SummaryTile
          icon={<Users className="h-5 w-5" />}
          label="With Capacity"
          value={venuesWithCapacity}
          helper={`${totalVenues > 0 ? Math.round((venuesWithCapacity / totalVenues) * 100) : 0}% have capacity`}
        />
        <SummaryTile
          icon={<Building2 className="h-5 w-5" />}
          label="With Images"
          value={venuesWithImages}
          helper={`${totalVenues > 0 ? Math.round((venuesWithImages / totalVenues) * 100) : 0}% have images`}
        />
      </div>

      <DataTable08
        data={venues}
        columns={columns}
        enableRowSelection
        enableSearch
        enableExport
        enableColumnVisibility
        enableViewToggle
        cardViewRenderer={renderVenueCard}
        searchPlaceholder="Search venues..."
        exportFilename="venues.csv"
        storageKey="venues-table"
        onBulkDelete={async (selected) => {
          try {
            const ids = selected.map((v: Venue) => v.id)
            await api.bulkDeleteVenues(ids)
            queryClient.invalidateQueries({ queryKey: ['venues'] })
            toast({ title: 'Success', description: `${selected.length} venue(s) deleted successfully` })
          } catch (error: any) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: error.message || 'Failed to delete venues',
            })
            throw error
          }
        }}
        onBulkDuplicate={async (selected) => {
          try {
            // Duplicate sequentially to avoid name/slug collisions between duplicates
            const results = []
            for (const venue of selected) {
              try {
                const duplicated = await api.duplicateVenue(venue.id, currentOrg!.id)
                results.push(duplicated)
                // Small delay to ensure database consistency
                await new Promise(resolve => setTimeout(resolve, 100))
              } catch (error: any) {
                console.error(`Failed to duplicate venue ${venue.id}:`, error)
                throw new Error(`Failed to duplicate "${venue.name}": ${error.message}`)
              }
            }
            queryClient.invalidateQueries({ queryKey: ['venues'] })
            toast({
              title: 'Success',
              description: `${results.length} venue(s) duplicated successfully`,
            })
          } catch (error: any) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: error.message || 'Failed to duplicate venues',
            })
            throw error
          }
        }}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteVenue(deleteId)
            setDeleteId(null)
          }
        }}
        title="Delete Venue"
        description="Are you sure you want to delete this venue? This action cannot be undone."
      />

      {editId && (
        <EditVenueDialog
          venueId={editId}
          open={!!editId}
          onOpenChange={(open) => !open && setEditId(null)}
        />
      )}
    </>
  )
}

