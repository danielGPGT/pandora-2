'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineEditTextareaProps {
  value: string
  onSave: (value: string) => Promise<void>
  className?: string
  displayClassName?: string
  placeholder?: string
  disabled?: boolean
  rows?: number
}

export function InlineEditTextarea({
  value,
  onSave,
  className,
  displayClassName,
  placeholder,
  disabled = false,
  rows = 3,
}: InlineEditTextareaProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={cn('min-h-[100px]', className)}
          placeholder={placeholder}
          disabled={isSaving}
          rows={rows}
          autoFocus
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded px-2 py-1 hover:bg-muted transition-colors min-h-[60px]',
        displayClassName
      )}
      onClick={() => !disabled && setIsEditing(true)}
    >
      {value ? (
        <p className="text-sm whitespace-pre-wrap">{value}</p>
      ) : (
        <span className="text-muted-foreground italic">{placeholder || 'Click to edit'}</span>
      )}
      {!disabled && (
        <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-muted-foreground">
          Click to edit
        </span>
      )}
    </div>
  )
}

