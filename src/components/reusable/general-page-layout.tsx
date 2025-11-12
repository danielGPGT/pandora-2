"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type GeneralPageLayoutProps = {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function GeneralPageLayout({ title, subtitle, actions, className, children }: GeneralPageLayoutProps) {
  return (
    <div className={cn("w-full", className)}>
      <header className="flex items-start justify-between gap-3 border-b pb-3 mb-4">
        <div className="space-y-0.5">
          {title && <h1 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>
      <div>
        {children}
      </div>
    </div>
  )
}


