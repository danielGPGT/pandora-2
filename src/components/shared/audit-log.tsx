'use client'

import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/lib/api/audit-logs'
import { ActivityTimeline } from '@/components/audit/activity-timeline'

interface AuditLogProps {
  entityType: string
  entityId: string
}

export function AuditLog({ entityType, entityId }: AuditLogProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', entityType, entityId],
    queryFn: () => getAuditLogs(entityType, entityId),
  })

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-8">Loading audit log...</div>
  }

  if (!logs?.length) {
    return (
      <ActivityTimeline
        logs={[]}
        emptyMessage="No activity recorded yet."
        showEntityType={false}
      />
    )
  }

  return (
    <ActivityTimeline
      logs={logs}
      emptyMessage="No activity recorded yet."
      showEntityType={false}
    />
  )
}

