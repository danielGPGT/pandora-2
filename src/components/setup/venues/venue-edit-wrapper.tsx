'use client'

import { useEffect, useState } from 'react'
import { VenueForm } from './venue-form'
import { useVenue } from '@/lib/hooks/use-venues'
import { PageLoading } from '@/components/shared/page-loading'

export function VenueEditWrapper({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const { venue, isLoading } = useVenue(id || '')

  useEffect(() => {
    params.then(({ id }) => setId(id))
  }, [params])

  if (!id || isLoading) {
    return <PageLoading />
  }

  if (!venue) {
    return <div>Venue not found</div>
  }

  return <VenueForm venue={venue} />
}

