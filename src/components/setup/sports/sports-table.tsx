'use client'

import { DataTable08 } from '@/components/reusable/data-tables/data-table'
import { useSports } from '@/lib/hooks/use-sports'
import { ColumnDef } from '@tanstack/react-table'
import { Sport } from '@/types/sports'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Copy, Eye, Loader2, Trophy, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { DeleteDialog } from '@/components/shared/delete-dialog'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { EmptyState } from '@/components/shared/empty-state'
import * as api from '@/lib/api/sports'
import { useOrganization } from '@/lib/hooks/use-organization'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { EditSportDialog } from './edit-sport-dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
        {row.original.icon_url && (
          <div className="relative h-8 w-8 rounded-md overflow-hidden shrink-0">
            <Image
              src={row.original.icon_url}
              alt={row.original.name}
              fill
              className="object-cover"
            />
          </div>
        )}
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
    <div
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 min-h-[2rem]"
    >
      {row.original.icon_url && (
        <div className="relative h-8 w-8 rounded-md overflow-hidden shrink-0">
          <Image
            src={row.original.icon_url}
            alt={row.original.name}
            fill
            className="object-cover"
          />
        </div>
      )}
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
    <code
      onClick={() => setIsEditing(true)}
      className="text-xs bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80 transition-colors"
    >
      {value || '-'}
    </code>
  )
}

function EditableSortOrderCell({ row, onUpdate }: { row: any; onUpdate: (id: string, value: number) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false)
  const currentValue = row.getValue('sort_order') as number
  const [value, setValue] = useState(String(currentValue))
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setValue(String(currentValue))
  }, [currentValue])

  const handleSave = async () => {
    const numValue = Number(value)
    if (isNaN(numValue) || numValue < 0) {
      setValue(String(currentValue))
      setIsEditing(false)
      return
    }
    if (numValue === currentValue) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onUpdate(row.original.id, numValue)
      setIsEditing(false)
    } catch (err) {
      setValue(String(currentValue))
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') {
            setValue(String(currentValue))
            setIsEditing(false)
          }
        }}
        autoFocus
        disabled={isSaving}
        className="h-8 w-20"
        min="0"
      />
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 min-h-[2rem] flex items-center"
    >
      {currentValue}
    </div>
  )
}

function EditableStatusCell({ row, onUpdate }: { row: any; onUpdate: (id: string, value: boolean) => Promise<void> }) {
  const [isSaving, setIsSaving] = useState(false)
  const isActive = row.getValue('is_active') ?? false

  const handleToggle = async (checked: boolean) => {
    if (checked === isActive) return
    setIsSaving(true)
    try {
      await onUpdate(row.original.id, checked)
    } catch (err) {
      // Error handling is done in the mutation
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      <Switch checked={isActive} onCheckedChange={handleToggle} disabled={isSaving} />
      <StatusBadge isActive={isActive} />
    </div>
  )
}

export function SportsTable() {
  const { sports, isLoading, deleteSport, duplicateSport, updateSport } = useSports()
  const { currentOrg } = useOrganization()
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Update handler for inline edits
  const handleFieldUpdate = (field: string) => async (id: string, value: any) => {
    try {
      await updateSport({ id, [field]: value } as any)
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to update sport:', error)
    }
  }

  // Card view renderer
  const renderSportCard = (row: any) => {
    const sport = row.original as Sport
    return (
      <EntityCard
        id={sport.id}
        title={sport.name}
        subtitle={sport.slug}
        imageUrl={sport.icon_url}
        imageAlt={sport.name}
        status={sport.is_active}
        statusLabel={{ active: 'Active', inactive: 'Inactive' }}
        fields={[
          {
            label: 'Sort Order',
            value: sport.sort_order,
          },
          ...(sport.description
            ? [
                {
                  label: 'Description',
                  value: (
                    <p className="line-clamp-2 text-muted-foreground">
                      {sport.description}
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
            onClick: () => setEditId(sport.id),
          },
          {
            label: 'Duplicate',
            icon: Copy,
            onClick: () => duplicateSport(sport.id),
          },
          {
            label: 'Delete',
            icon: Trash2,
            onClick: () => setDeleteId(sport.id),
            variant: 'destructive',
          },
        ]}
        viewHref={`/setup/sports/${sport.id}`}
        enableSelection={true}
        isSelected={row.getIsSelected()}
        onSelect={(id, selected) => row.toggleSelected(selected)}
      />
    )
  }

  const columns: ColumnDef<Sport>[] = [
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
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => <EditableStatusCell row={row} onUpdate={handleFieldUpdate('is_active')} />,
    },
    {
      accessorKey: 'sort_order',
      header: 'Order',
      cell: ({ row }) => <EditableSortOrderCell row={row} onUpdate={handleFieldUpdate('sort_order')} />,
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
            <DropdownMenuItem onClick={() => router.push(`/setup/sports/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditId(row.original.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateSport(row.original.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
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

  if (!sports?.length) {
    return (
      <EmptyState
        icon={Trophy}
        title="No sports yet"
        description="Get started by creating your first sport"
        action={{
          label: 'Add Sport',
          onClick: () => {
            // This will be handled by the CreateSportDialog in the page header
            router.push('/setup/sports')
          },
        }}
      />
    )
  }

  // Calculate metrics
  const totalSports = sports?.length || 0
  const activeSports = sports?.filter((s) => s.is_active).length || 0
  const inactiveSports = sports?.filter((s) => !s.is_active).length || 0
  const sportsWithImages = sports?.filter((s) => s.icon_url || s.image_url).length || 0

  return (
    <>
      {/* Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryTile
          icon={<Trophy className="h-5 w-5" />}
          label="Total Sports"
          value={totalSports}
          helper={totalSports === 1 ? 'sport' : 'sports'}
        />
        <SummaryTile
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Active Sports"
          value={activeSports}
          helper={`${totalSports > 0 ? Math.round((activeSports / totalSports) * 100) : 0}% of total`}
        />
        <SummaryTile
          icon={<XCircle className="h-5 w-5" />}
          label="Inactive Sports"
          value={inactiveSports}
          helper={`${totalSports > 0 ? Math.round((inactiveSports / totalSports) * 100) : 0}% of total`}
        />
        <SummaryTile
          icon={<ImageIcon className="h-5 w-5" />}
          label="With Images"
          value={sportsWithImages}
          helper={`${totalSports > 0 ? Math.round((sportsWithImages / totalSports) * 100) : 0}% have images`}
        />
      </div>

      <DataTable08
        data={sports}
        columns={columns}
        enableRowSelection
        enableSearch
        enableExport
        enableColumnVisibility
        enableViewToggle
        cardViewRenderer={renderSportCard}
        searchPlaceholder="Search sports..."
        exportFilename="sports.csv"
        storageKey="sports-table"
        onBulkDelete={async (selected) => {
          try {
            const ids = selected.map((s: Sport) => s.id)
            await api.bulkDeleteSports(ids)
            queryClient.invalidateQueries({ queryKey: ['sports'] })
            toast({ title: 'Success', description: `${selected.length} sport(s) deleted successfully` })
          } catch (error: any) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: error.message || 'Failed to delete sports',
            })
            throw error // Re-throw so DataTable08 can handle it
          }
        }}
        onBulkStatusChange={async (selected, status) => {
          try {
            const ids = selected.map((s: Sport) => s.id)
            await api.bulkUpdateSportsStatus(ids, status)
            queryClient.invalidateQueries({ queryKey: ['sports'] })
            toast({
              title: 'Success',
              description: `${selected.length} sport(s) ${status ? 'activated' : 'deactivated'} successfully`,
            })
          } catch (error: any) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: error.message || 'Failed to update sports status',
            })
            throw error // Re-throw so DataTable08 can handle it
          }
        }}
        onBulkDuplicate={async (selected) => {
          try {
            // Duplicate sequentially to avoid name/slug collisions between duplicates
            const results = []
            for (const sport of selected) {
              try {
                const duplicated = await api.duplicateSport(sport.id, currentOrg!.id)
                results.push(duplicated)
                // Small delay to ensure database consistency
                await new Promise(resolve => setTimeout(resolve, 100))
              } catch (error: any) {
                // Log individual failures but continue with others
                console.error(`Failed to duplicate sport ${sport.id}:`, error)
                throw new Error(`Failed to duplicate "${sport.name}": ${error.message}`)
              }
            }
            queryClient.invalidateQueries({ queryKey: ['sports'] })
            toast({ 
              title: 'Success', 
              description: `${results.length} sport(s) duplicated successfully` 
            })
          } catch (error: any) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: error.message || 'Failed to duplicate sports',
            })
            throw error // Re-throw so DataTable08 can handle it
          }
        }}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteSport(deleteId)
            setDeleteId(null)
          }
        }}
        title="Delete Sport"
        description="Are you sure you want to delete this sport? This action cannot be undone."
      />

      {editId && (
        <EditSportDialog
          sportId={editId}
          open={!!editId}
          onOpenChange={(open) => !open && setEditId(null)}
        />
      )}
    </>
  )
}

