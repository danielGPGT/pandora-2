"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Image from "next/image"

type DetailField = {
  label: string
  value: React.ReactNode
  span?: 1 | 2 | 3 | 4 // Grid column span
  className?: string
  labelClassName?: string
  valueClassName?: string
}

type DetailSection = {
  title: string
  description?: string
  fields: DetailField[]
  className?: string
  icon?: React.ComponentType<{ className?: string }>
}

type DetailsContentProps = {
  sections: DetailSection[]
  className?: string
  gridCols?: 1 | 2 | 3 | 4
  variant?: "default" | "compact" | "spacious"
}

export function DetailsContent({ 
  sections, 
  className, 
  gridCols = 2,
  variant = "default"
}: DetailsContentProps) {
  const spacing = {
    default: "space-y-4",
    compact: "space-y-3",
    spacious: "space-y-6"
  }

  const cardPadding = {
    default: "p-4",
    compact: "p-3",
    spacious: "p-6"
  }

  return (
    <div className={cn(spacing[variant], className)}>
      {sections.map((section, sectionIndex) => (
        <Card 
          key={sectionIndex} 
          className={cn(
            "overflow-hidden transition-shadow hover:shadow-sm py-0",
            section.className
          )}
        >
          <CardHeader className={cn("border-b bg-muted/40 py-3 px-4 !pb-0", cardPadding[variant])}>
            <div className="flex items-center gap-2">
              {section.icon && (
                <section.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold tracking-tight">
                  {section.title}
                </CardTitle>
                {section.description && (
                  <CardDescription className="mt-0.5 text-xs">
                    {section.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className={cn("pt-4", cardPadding[variant])}>
            <div
              className={cn(
                "grid gap-4",
                gridCols === 1 && "grid-cols-1",
                gridCols === 2 && "grid-cols-1 md:grid-cols-2",
                gridCols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                gridCols === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              )}
            >
              {section.fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className={cn(
                    "group relative space-y-1.5",
                    field.span === 2 && "md:col-span-2",
                    field.span === 3 && "md:col-span-3",
                    field.span === 4 && "md:col-span-4",
                    field.className
                  )}
                >
                  <div className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                    field.labelClassName
                  )}>
                    {field.label}
                  </div>
                  <div className={cn(
                    "text-sm font-medium leading-snug text-foreground",
                    field.valueClassName
                  )}>
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Helper component for displaying empty/null values
export function DetailValue({ 
  value, 
  emptyText = "Not set",
  className 
}: { 
  value: React.ReactNode | null | undefined
  emptyText?: string
  className?: string 
}) {
  if (value === null || value === undefined || value === "") {
    return (
      <span className={cn("text-muted-foreground italic font-normal", className)}>
        {emptyText}
      </span>
    )
  }
  return <span className={className}>{value}</span>
}

// Helper component for displaying image fields
export function DetailImage({ 
  src, 
  alt, 
  className,
  size = "md",
  rounded = true
}: { 
  src?: string | null
  alt: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  rounded?: boolean
}) {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-24 w-24",
    lg: "h-36 w-36",
    xl: "h-48 w-full"
  }

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center border-2 border-dashed bg-muted/30 text-muted-foreground transition-colors",
          rounded && "rounded-lg",
          sizeClasses[size],
          size === "xl" && "aspect-video",
          className
        )}
      >
        <div className="text-center p-4">
          <svg
            className="mx-auto h-8 w-8 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-xs">No image</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden border bg-muted transition-all hover:shadow-lg",
        rounded && "rounded-lg",
        sizeClasses[size],
        size === "xl" && "aspect-video",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={size === "xl" ? "100vw" : "256px"}
      />
    </div>
  )
}

// Helper component for displaying badge/status fields
export function DetailBadge({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {children}
    </div>
  )
}

// Helper component for displaying code/monospace values
export function DetailCode({ 
  value, 
  className 
}: { 
  value: string
  className?: string 
}) {
  return (
    <code className={cn(
      "inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-mono font-medium text-foreground",
      className
    )}>
      {value}
    </code>
  )
}

// Helper component for displaying date/time values
export function DetailDate({ 
  date, 
  format = "long",
  className 
}: { 
  date: string | Date | null | undefined
  format?: "short" | "long" | "relative"
  className?: string 
}) {
  if (!date) {
    return <DetailValue value={null} className={className} />
  }

  const dateObj = typeof date === "string" ? new Date(date) : date

  let formatted: string
  if (format === "relative") {
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) formatted = "Today"
    else if (days === 1) formatted = "Yesterday"
    else if (days < 7) formatted = `${days} days ago`
    else if (days < 30) formatted = `${Math.floor(days / 7)} weeks ago`
    else if (days < 365) formatted = `${Math.floor(days / 30)} months ago`
    else formatted = `${Math.floor(days / 365)} years ago`
  } else if (format === "short") {
    formatted = dateObj.toLocaleDateString()
  } else {
    formatted = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <span className={cn("text-foreground", className)}>
      {formatted}
    </span>
  )
}

