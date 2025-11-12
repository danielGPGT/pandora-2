export interface AuditLog {
  id: string
  tenant_id: string
  user_id: string
  user_email?: string
  entity_type: string
  entity_id: string
  action: 'created' | 'updated' | 'deleted' | 'duplicated'
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  created_at: string
}

