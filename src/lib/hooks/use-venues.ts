'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useOrganization } from './use-organization'
import { useToast } from '@/hooks/use-toast'
import * as api from '@/lib/api/venues'
import type { CreateVenueInput, UpdateVenueInput } from '@/types/venues'

export function useVenues() {
  const { currentOrg } = useOrganization()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: venues, isLoading } = useQuery({
    queryKey: ['venues', currentOrg?.id],
    queryFn: () => api.getVenues(currentOrg!.id),
    enabled: !!currentOrg,
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateVenueInput) => api.createVenue(input, currentOrg!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      toast({ title: 'Success', description: 'Venue created successfully' })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: UpdateVenueInput) => api.updateVenue(input),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['venue', newData.id] })
      await queryClient.cancelQueries({ queryKey: ['venues', currentOrg?.id] })

      // Snapshot the previous values
      const previousVenue = queryClient.getQueryData(['venue', newData.id])
      const previousVenues = queryClient.getQueryData(['venues', currentOrg?.id])

      // Optimistically update the single venue
      if (previousVenue) {
        queryClient.setQueryData(['venue', newData.id], (old: any) => ({
          ...old,
          ...newData,
        }))
      }

      // Optimistically update the venues list
      if (previousVenues && Array.isArray(previousVenues)) {
        queryClient.setQueryData(
          ['venues', currentOrg?.id],
          (old: any[]) =>
            old?.map((venue: any) =>
              venue.id === newData.id ? { ...venue, ...newData } : venue
            ) || []
        )
      }

      return { previousVenue, previousVenues }
    },
    onError: (error: any, newData, context) => {
      // Rollback on error
      if (context?.previousVenue) {
        queryClient.setQueryData(['venue', newData.id], context.previousVenue)
      }
      if (context?.previousVenues) {
        queryClient.setQueryData(['venues', currentOrg?.id], context.previousVenues)
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
    onSuccess: (data) => {
      // Update with server response
      queryClient.setQueryData(['venue', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['venues', currentOrg?.id] })
      toast({ title: 'Success', description: 'Venue updated successfully' })
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['venue'] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      toast({ title: 'Success', description: 'Venue deleted successfully' })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.duplicateVenue(id, currentOrg!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      toast({ title: 'Success', description: 'Venue duplicated successfully' })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  return {
    venues,
    isLoading,
    createVenue: createMutation.mutate,
    updateVenue: updateMutation.mutateAsync,
    deleteVenue: deleteMutation.mutate,
    duplicateVenue: duplicateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  }
}

export function useVenue(id: string) {
  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => api.getVenue(id),
    enabled: !!id,
  })

  return { venue, isLoading }
}

