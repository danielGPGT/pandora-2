'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { EditSportDialog } from './edit-sport-dialog'

interface SportDetailActionsProps {
  sportId: string
}

export function SportDetailActions({ sportId }: SportDetailActionsProps) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setEditOpen(true)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </Button>
      <EditSportDialog
        sportId={sportId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}

