export interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
  app_metadata: {
    tenant_id?: string
    tenant_name?: string
    tenant_slug?: string
    role?: 'admin' | 'sales_manager' | 'sales_agent' | 'operations_manager' | 'finance_manager' | 'read_only'
  }
}

export interface Tenant {
  id: string
  name: string
  slug: string
  default_currency: string
  settings: Record<string, any>
}

export type Role = 'admin' | 'sales_manager' | 'sales_agent' | 'operations_manager' | 'finance_manager' | 'read_only'

