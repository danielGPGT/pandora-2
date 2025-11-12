export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  default_currency: string
  subscription_plan: string
  subscription_status: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'sales_manager' | 'sales_agent' | 'operations_manager' | 'finance_manager' | 'member'
  joined_at: string
}

export type Role = OrganizationMember['role']
