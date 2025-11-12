import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  isActive: boolean
  activeLabel?: string
  inactiveLabel?: string
}

export function StatusBadge({ 
  isActive, 
  activeLabel = 'Active', 
  inactiveLabel = 'Inactive' 
}: StatusBadgeProps) {
  return (
    <Badge
      variant={isActive ? 'default' : 'secondary'}
      className={cn(
        isActive ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400' : ''
      )}
    >
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  )
}

