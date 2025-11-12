'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'

interface SlugInputProps {
  value: string
  onChange: (value: string) => void
  sourceValue?: string
  label?: string
  placeholder?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function SlugInput({ 
  value, 
  onChange, 
  sourceValue, 
  label = 'Slug',
  placeholder = 'auto-generated'
}: SlugInputProps) {
  useEffect(() => {
    if (sourceValue && !value) {
      onChange(slugify(sourceValue))
    }
  }, [sourceValue, value, onChange])

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(slugify(e.target.value))}
        placeholder={placeholder}
      />
      <p className="text-xs text-muted-foreground">
        Used in URLs. Auto-generated from name if left blank.
      </p>
    </div>
  )
}

