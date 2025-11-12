'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useOrganizationStore } from '@/stores/organization-store'
import { useUser } from './use-user'

export function useOrganization() {
  const { user } = useUser()
  const { currentOrg, organizations, setCurrentOrg, setOrganizations } = useOrganizationStore()

  const { data: orgsData } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: async () => {
      if (!user) return null

      // Use API route to bypass RLS issues
      const response = await fetch('/api/organizations/list')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch organizations')
      }

      const data = await response.json()
      return data.organizations || []
    },
    enabled: !!user,
  })

  useEffect(() => {
    if (orgsData) {
      const orgs = orgsData
        .filter((item: any) => item.organization) // Filter out any null organizations
        .map((item: any) => ({
          id: item.organization.id,
          name: item.organization.name,
          slug: item.organization.slug,
          logo_url: item.organization.logo_url,
          default_currency: item.organization.default_currency || 'GBP',
          subscription_plan: item.organization.subscription_plan || 'free',
          subscription_status: item.organization.subscription_status || 'active',
          role: item.role,
        }))
      setOrganizations(orgs)

      // Set current org if not set
      if (!currentOrg && orgs.length > 0) {
        setCurrentOrg(orgs[0])
      }
    }
  }, [orgsData, currentOrg, setOrganizations, setCurrentOrg])

  return {
    currentOrg,
    organizations,
    switchOrganization: useOrganizationStore((state) => state.switchOrganization),
  }
}

