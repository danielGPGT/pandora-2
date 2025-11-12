'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface InlineEditSelectProps {
  value: string
  onSave: (value: string) => Promise<void>
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
  displayClassName?: string
  disabled?: boolean
  emptyLabel?: string
}

export function InlineEditSelect({
  value,
  onSave,
  options,
  placeholder = 'Select...',
  className,
  displayClassName,
  disabled = false,
  emptyLabel = 'Not set',
}: InlineEditSelectProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = async (newValue?: string) => {
    const finalValue = newValue !== undefined ? newValue : editValue
    const cleanValue = finalValue === '__none__' ? '' : finalValue
    if (cleanValue === value) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onSave(cleanValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
      setEditValue(value)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const selectedOption = options.find((opt) => opt.value === value)

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select
          value={editValue || '__none__'}
          onValueChange={(newValue) => {
            setEditValue(newValue)
            if (newValue !== '__none__') {
              handleSave(newValue)
            }
          }}
          onOpenChange={(open) => {
            if (!open) {
              if (editValue === '__none__' && value) {
                handleSave('')
              } else if (editValue !== (value || '__none__')) {
                handleSave()
              } else {
                setIsEditing(false)
              }
            }
          }}
          disabled={isSaving}
        >
          <SelectTrigger className={cn('h-8', className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{emptyLabel}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4 text-green-600" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded px-2 py-1 hover:bg-muted transition-colors',
        displayClassName
      )}
      onClick={() => !disabled && setIsEditing(true)}
    >
      {selectedOption ? (
        <span>{selectedOption.label}</span>
      ) : (
        <span className="text-muted-foreground italic">{emptyLabel}</span>
      )}
      {!disabled && (
        <span className="ml-2 opacity-0 group-hover:opacity-100 text-xs text-muted-foreground">
          Click to edit
        </span>
      )}
    </div>
  )
}

