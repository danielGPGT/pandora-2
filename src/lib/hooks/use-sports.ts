'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useOrganization } from './use-organization'
import { useToast } from '@/hooks/use-toast'
import * as api from '@/lib/api/sports'
import type { CreateSportInput, UpdateSportInput } from '@/types/sports'

export function useSports() {
  const { currentOrg } = useOrganization()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: sports, isLoading } = useQuery({
    queryKey: ['sports', currentOrg?.id],
    queryFn: () => api.getSports(currentOrg!.id),
    enabled: !!currentOrg,
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateSportInput) => api.createSport(input, currentOrg!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] })
      toast({ title: 'Success', description: 'Sport created successfully' })
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
    mutationFn: (input: UpdateSportInput) => api.updateSport(input),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['sport', newData.id] })
      await queryClient.cancelQueries({ queryKey: ['sports', currentOrg?.id] })

      // Snapshot the previous values
      const previousSport = queryClient.getQueryData(['sport', newData.id])
      const previousSports = queryClient.getQueryData(['sports', currentOrg?.id])

      // Optimistically update the single sport
      if (previousSport) {
        queryClient.setQueryData(['sport', newData.id], {
          ...previousSport,
          ...newData,
        })
      }

      // Optimistically update the sports list
      if (previousSports && Array.isArray(previousSports)) {
        queryClient.setQueryData(
          ['sports', currentOrg?.id],
          (old: any[]) =>
            old?.map((sport) =>
              sport.id === newData.id ? { ...sport, ...newData } : sport
            ) || []
        )
      }

      return { previousSport, previousSports }
    },
    onError: (error: any, newData, context) => {
      // Rollback on error
      if (context?.previousSport) {
        queryClient.setQueryData(['sport', newData.id], context.previousSport)
      }
      if (context?.previousSports) {
        queryClient.setQueryData(['sports', currentOrg?.id], context.previousSports)
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
    onSuccess: (data) => {
      // Update with server response
      queryClient.setQueryData(['sport', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['sports', currentOrg?.id] })
      toast({ title: 'Success', description: 'Sport updated successfully' })
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['sport'] })
      queryClient.invalidateQueries({ queryKey: ['sports'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteSport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] })
      toast({ title: 'Success', description: 'Sport deleted successfully' })
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
    mutationFn: (id: string) => api.duplicateSport(id, currentOrg!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] })
      toast({ title: 'Success', description: 'Sport duplicated successfully' })
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
    sports,
    isLoading,
    createSport: createMutation.mutate,
    updateSport: updateMutation.mutate,
    deleteSport: deleteMutation.mutate,
    duplicateSport: duplicateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  }
}

export function useSport(id: string) {
  const { data: sport, isLoading } = useQuery({
    queryKey: ['sport', id],
    queryFn: () => api.getSport(id),
    enabled: !!id,
  })

  return { sport, isLoading }
}

