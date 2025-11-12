'use client'

import { useOrganization } from './use-organization'

export type Permission =
  | 'bookings:view'
  | 'bookings:create'
  | 'bookings:edit'
  | 'bookings:delete'
  | 'quotes:view'
  | 'quotes:create'
  | 'quotes:edit'
  | 'packages:view'
  | 'packages:create'
  | 'packages:edit'
  | 'members:manage'
  | 'settings:manage'

const permissions: Record<string, Permission[]> = {
  owner: [
    'bookings:view', 'bookings:create', 'bookings:edit', 'bookings:delete',
    'quotes:view', 'quotes:create', 'quotes:edit',
    'packages:view', 'packages:create', 'packages:edit',
    'members:manage', 'settings:manage'
  ],
  admin: [
    'bookings:view', 'bookings:create', 'bookings:edit', 'bookings:delete',
    'quotes:view', 'quotes:create', 'quotes:edit',
    'packages:view', 'packages:create', 'packages:edit',
    'members:manage'
  ],
  sales_manager: [
    'bookings:view', 'bookings:create', 'bookings:edit',
    'quotes:view', 'quotes:create', 'quotes:edit',
    'packages:view'
  ],
  sales_agent: [
    'bookings:view', 'bookings:create',
    'quotes:view', 'quotes:create',
    'packages:view'
  ],
  operations_manager: [
    'bookings:view', 'bookings:edit',
    'packages:view', 'packages:create', 'packages:edit'
  ],
  finance_manager: [
    'bookings:view',
    'quotes:view'
  ],
  member: [
    'bookings:view',
    'quotes:view',
    'packages:view'
  ],
}

export function usePermissions() {
  const { currentOrg } = useOrganization()
  const role = currentOrg?.role || 'member'

  const can = (permission: Permission): boolean => {
    return permissions[role]?.includes(permission) ?? false
  }

  return { can, role }
}

