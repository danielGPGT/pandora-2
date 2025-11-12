import { createClient } from '@/lib/supabase/client'
import type { AuditLog } from '@/types/audit'
import type { AuditLogEntry } from '@/components/audit/activity-timeline'

interface LogAuditActionInput {
  entityType: string
  entityId: string
  action: 'created' | 'updated' | 'deleted' | 'duplicated'
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
}

export async function logAuditAction({
  entityType,
  entityId,
  action,
  oldValues,
  newValues,
}: LogAuditActionInput) {
  // Use API route to bypass RLS issues
  try {
    const response = await fetch('/api/audit-logs/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entityType,
        entityId,
        action,
        oldValues,
        newValues,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Failed to log audit action:', error)
      console.error('Response status:', response.status)
      // Don't throw - audit logging shouldn't break the main operation
    }
  } catch (error) {
    console.error('Error logging audit action:', error)
    // Don't throw - audit logging shouldn't break the main operation
  }
}

export async function getAuditLogs(entityType: string, entityId: string) {
  // Use API route to bypass RLS issues
  const response = await fetch(
    `/api/audit-logs?entity_type=${entityType}&entity_id=${entityId}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch audit logs')
  }

  const data = await response.json()
  return data.logs as AuditLogEntry[]
}

