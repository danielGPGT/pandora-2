'use client'

import { useSport } from '@/lib/hooks/use-sports'
import { SportForm } from './sport-form'

export function SportEditWrapper({ id }: { id: string }) {
  const { sport, isLoading } = useSport(id)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!sport) {
    return <div>Sport not found</div>
  }

  return <SportForm sport={sport} />
}

