'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SportForm } from './sport-form'

export function CreateSportDialog() {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Sport
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sport</DialogTitle>
          <DialogDescription>
            Add a new sport to your system
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <SportForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

