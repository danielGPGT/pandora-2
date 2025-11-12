'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useOrganization } from '@/lib/hooks/use-organization'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface MultiImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  label?: string
  bucket?: string
  folder?: string
  maxImages?: number
  maxSizeMB?: number
}

export function MultiImageUpload({
  value = [],
  onChange,
  label = 'Images',
  bucket = 'images',
  folder = 'general',
  maxImages = 5,
  maxSizeMB = 5,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const { currentOrg } = useOrganization()
  const { toast } = useToast()
  const supabase = createClient()

  const images = value || []
  const canAddMore = images.length < maxImages

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !currentOrg) return

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `You can only upload up to ${maxImages} images. You currently have ${images.length} image(s).`,
      })
      return
    }

    setIsUploading(true)

    // Upload files sequentially
    const newUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadingIndex(i)

      try {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`)
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`${file.name} must be less than ${maxSizeMB}MB`)
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${currentOrg.id}/${folder}/${Date.now()}-${i}.${fileExt}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
        newUrls.push(data.publicUrl)
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || `Failed to upload ${file.name}`,
        })
        // Continue with other files even if one fails
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls])
      toast({
        title: 'Success',
        description: `${newUrls.length} image(s) uploaded successfully`,
      })
    }

    setIsUploading(false)
    setUploadingIndex(null)
    // Reset input
    e.target.value = ''
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleRemoveAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {images.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAll}
            className="h-8 text-xs"
          >
            Remove All
          </Button>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                <Image
                  src={url}
                  alt={`${label} ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
            id={`multi-upload-${label}`}
          />
          <Label
            htmlFor={`multi-upload-${label}`}
            className={cn(
              'flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              isUploading
                ? 'bg-muted border-muted-foreground/50 cursor-not-allowed'
                : 'hover:bg-muted/50 border-muted-foreground/50 hover:border-muted-foreground'
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Uploading{uploadingIndex !== null ? ` (${uploadingIndex + 1})` : ''}...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground text-center px-4">
                  Upload images ({images.length}/{maxImages})
                </span>
              </div>
            )}
          </Label>
        </div>
      )}

      {!canAddMore && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxImages} images reached. Remove an image to add more.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        You can upload up to {maxImages} images. Each image must be under {maxSizeMB}MB.
      </p>
    </div>
  )
}

