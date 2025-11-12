'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2, Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export interface EntityCardField {
  label: string
  value: React.ReactNode
  className?: string
}

export interface EntityCardAction {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'destructive'
}

export interface EntityCardProps {
  // Entity data
  id: string
  title: string
  subtitle?: string
  imageUrl?: string | null
  imageAlt?: string
  status?: boolean
  statusLabel?: { active: string; inactive: string }
  
  // Fields to display
  fields?: EntityCardField[]
  
  // Actions
  actions?: EntityCardAction[]
  onView?: (id: string) => void
  viewHref?: string
  
  // Selection
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void
  enableSelection?: boolean
  
  // Styling
  className?: string
}

export function EntityCard({
  id,
  title,
  subtitle,
  imageUrl,
  imageAlt,
  status,
  statusLabel,
  fields = [],
  actions = [],
  onView,
  viewHref,
  isSelected = false,
  onSelect,
  enableSelection = false,
  className,
}: EntityCardProps) {
  const router = useRouter()

  const handleView = () => {
    if (viewHref) {
      router.push(viewHref)
    } else if (onView) {
      onView(id)
    }
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
        className
      )}
    >
      {enableSelection && (
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(id, !!checked)}
            onClick={(e) => e.stopPropagation()}
            className="bg-background/80 backdrop-blur-sm"
          />
        </div>
      )}

      {/* Header with image */}
      <CardHeader className="">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {imageUrl && (
                <div className="relative h-10 w-10 rounded-md overflow-hidden shrink-0 border">
                  <Image
                    src={imageUrl}
                    alt={imageAlt || title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-sm truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={handleView}
                >
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {status !== undefined && (
              <div className="mt-2">
                <StatusBadge
                  isActive={status}
                  activeLabel={statusLabel?.active}
                  inactiveLabel={statusLabel?.inactive}
                />
              </div>
            )}
          </div>

          {/* Actions menu */}
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {onView || viewHref ? (
                  <>
                    <DropdownMenuItem onClick={handleView}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      action.onClick()
                    }}
                    className={action.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''}
                  >
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {/* Fields */}
      {fields.length > 0 && (
        <CardContent className="pt-0 space-y-2">
          {fields.map((field, index) => (
            <div key={index} className={cn('text-xs', field.className)}>
              <span className="text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
                {field.label}
              </span>
              <div className="mt-0.5 text-sm">{field.value}</div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}

