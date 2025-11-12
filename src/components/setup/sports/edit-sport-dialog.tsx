'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SportForm } from './sport-form'
import { useSport } from '@/lib/hooks/use-sports'
import { PageLoading } from '@/components/shared/page-loading'

interface EditSportDialogProps {
  sportId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSportDialog({ sportId, open, onOpenChange }: EditSportDialogProps) {
  const { sport, isLoading } = useSport(sportId)

  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sport</DialogTitle>
          <DialogDescription>
            Update the sport details
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <PageLoading />
          ) : sport ? (
            <SportForm sport={sport} onSuccess={handleSuccess} />
          ) : (
            <div>Sport not found</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

