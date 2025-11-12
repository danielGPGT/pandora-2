'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineEditFieldProps {
  value: string | number
  onSave: (value: string | number) => Promise<void>
  type?: 'text' | 'number'
  className?: string
  displayClassName?: string
  placeholder?: string
  disabled?: boolean
}

export function InlineEditField({
  value,
  onSave,
  type = 'text',
  className,
  displayClassName,
  placeholder,
  disabled = false,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const finalValue = type === 'number' ? Number(editValue) : editValue
      await onSave(finalValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(String(value))
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={cn('h-8', className)}
          placeholder={placeholder}
          disabled={isSaving}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave()
            } else if (e.key === 'Escape') {
              handleCancel()
            }
          }}
        />
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
      {value || <span className="text-muted-foreground italic">{placeholder || 'Click to edit'}</span>}
      {!disabled && (
        <span className="ml-2 opacity-0 group-hover:opacity-100 text-xs text-muted-foreground">
          Click to edit
        </span>
      )}
    </div>
  )
}

