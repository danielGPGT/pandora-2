'use client'

import { Switch } from '@/components/ui/switch'
import { useCallback, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface InlineEditSwitchProps {
  value: boolean
  onSave: (value: boolean) => Promise<void>
  label?: string
  disabled?: boolean
}

export function InlineEditSwitch({
  value,
  onSave,
  label,
  disabled = false,
}: InlineEditSwitchProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)

  const handleChange = useCallback(async (checked: boolean) => {
    if (disabled || isSaving) return
    
    setCurrentValue(checked)
    setIsSaving(true)
    try {
      await onSave(checked)
    } catch (error) {
      console.error('Failed to save:', error)
      setCurrentValue(value) // Revert on error
    } finally {
      setIsSaving(false)
    }
  }, [disabled, isSaving, onSave, value])

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={currentValue}
        onCheckedChange={handleChange}
        disabled={disabled || isSaving}
      />
      {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}

