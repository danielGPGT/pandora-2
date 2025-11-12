'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface Country {
  code: string
  name: string
  iso3?: string
  region?: string
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('countries')
        .select('code, name, iso3, region')
        .order('name', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch countries: ${error.message}`)
      }

      return (data || []) as Country[]
    },
    staleTime: 1000 * 60 * 60, // 1 hour - countries don't change often
  })
}

