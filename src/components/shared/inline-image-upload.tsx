'use client'

import { useState, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useOrganization } from '@/lib/hooks/use-organization'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface InlineImageUploadProps {
  value?: string
  onChange: (url: string) => Promise<void>
  folder: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  aspectRatio?: 'square' | 'wide' | 'tall'
  className?: string
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-32 w-32',
  lg: 'h-48 w-48',
}

const aspectRatios = {
  square: 'aspect-square',
  wide: 'aspect-video',
  tall: 'aspect-[3/4]',
}

export function InlineImageUpload({
  value,
  onChange,
  folder,
  label,
  size = 'md',
  aspectRatio = 'square',
  className,
}: InlineImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { currentOrg } = useOrganization()
  const { toast } = useToast()
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentOrg) return

    setIsUploading(true)
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB')
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentOrg.id}/${folder}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('setup-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('setup-images')
        .getPublicUrl(fileName)

      await onChange(data.publicUrl)
      toast({ title: 'Success', description: 'Image uploaded successfully' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    try {
      await onChange('')
      toast({ title: 'Success', description: 'Image removed successfully' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    }
  }

  const containerSize = sizeClasses[size]
  const uniqueId = useId()

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'relative group rounded-md border transition-all cursor-pointer',
          value
            ? 'border-border bg-card shadow-sm hover:shadow-md'
            : 'border-dashed border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/40',
          containerSize,
          aspectRatios[aspectRatio],
          'overflow-hidden'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {value ? (
          <>
            <div className="relative h-full w-full">
              <Image
                src={value}
                alt={label || 'Image'}
                fill
                className="object-cover"
                sizes={size === 'lg' ? '256px' : size === 'md' ? '128px' : '64px'}
              />
            </div>
            {/* Overlay with actions */}
            <div
              className={cn(
                'absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-all duration-200',
                isHovered || isUploading ? 'opacity-100' : 'opacity-0'
              )}
            >
              <div className="flex h-full items-center justify-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={isUploading}
                  className="hidden"
                  id={uniqueId}
                />
                <Label htmlFor={uniqueId} className="cursor-pointer">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isUploading}
                    className="h-8 gap-1.5 bg-background/90 hover:bg-background"
                    asChild
                  >
                    <span>
                      {isUploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      Replace
                    </span>
                  </Button>
                </Label>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="h-8 gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 p-3">
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
              id={uniqueId}
            />
            <Label htmlFor={uniqueId} className="cursor-pointer w-full h-full flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="rounded-md bg-muted/50 p-2.5">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground text-center">
                    {label || 'Click to upload'}
                  </span>
                </div>
              )}
            </Label>
          </div>
        )}
      </div>
    </div>
  )
}

