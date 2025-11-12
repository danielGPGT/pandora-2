"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type DetailsPageLayoutProps = {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  backHref?: string
  className?: string
  children: React.ReactNode
}

export function DetailsPageLayout({ title, subtitle, badge, actions, backHref, className, children }: DetailsPageLayoutProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header with back button */}
      <header className="border-b pb-4 mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0 h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h1>
              </div>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl line-clamp-2">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </header>
      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  )
}

