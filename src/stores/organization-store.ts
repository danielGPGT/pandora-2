import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  default_currency?: string
  subscription_plan?: string
  subscription_status?: string
  role: string
}

interface OrganizationState {
  currentOrg: Organization | null
  organizations: Organization[]
  setCurrentOrg: (org: Organization | null) => void
  setOrganizations: (orgs: Organization[]) => void
  switchOrganization: (orgId: string) => void
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      currentOrg: null,
      organizations: [],
      setCurrentOrg: (org) => set({ currentOrg: org }),
      setOrganizations: (orgs) => set({ organizations: orgs }),
      switchOrganization: (orgId: string) => {
        const org = get().organizations.find((o) => o.id === orgId)
        if (org) {
          set({ currentOrg: org })
          // Set cookie for server-side access
          if (typeof document !== 'undefined') {
            document.cookie = `current_org_id=${orgId}; path=/; max-age=31536000`
          }
        }
      },
    }),
    {
      name: 'organization-storage',
    }
  )
)

