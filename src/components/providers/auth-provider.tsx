'use client'

import { useUser } from '@/lib/hooks/use-user'
import { useOrganization } from '@/lib/hooks/use-organization'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useUser() // Initialize user
  useOrganization() // Initialize organizations
  
  return <>{children}</>
}

