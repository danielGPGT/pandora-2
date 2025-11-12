'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { EditVenueDialog } from './edit-venue-dialog'

interface VenueDetailActionsProps {
  venueId: string
}

export function VenueDetailActions({ venueId }: VenueDetailActionsProps) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setEditOpen(true)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </Button>
      <EditVenueDialog
        venueId={venueId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}

