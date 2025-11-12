'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VenueForm } from './venue-form'
import { useVenue } from '@/lib/hooks/use-venues'
import { PageLoading } from '@/components/shared/page-loading'

interface EditVenueDialogProps {
  venueId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVenueDialog({ venueId, open, onOpenChange }: EditVenueDialogProps) {
  const { venue, isLoading } = useVenue(venueId)

  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Venue</DialogTitle>
          <DialogDescription>
            Update the venue details
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <PageLoading />
          ) : venue ? (
            <VenueForm venue={venue} onSuccess={handleSuccess} />
          ) : (
            <div>Venue not found</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

