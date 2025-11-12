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

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  bucket?: string
  folder?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  label = 'Image',
  bucket = 'setup-images',
  folder = 'general'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
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
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      onChange(data.publicUrl)
      toast({ title: 'Success', description: 'Image uploaded successfully' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="relative inline-block">
          <div className="relative h-32 w-32 rounded-lg border overflow-hidden">
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
            id={`upload-${label}`}
          />
          <Label
            htmlFor={`upload-${label}`}
            className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border border-dashed hover:bg-muted"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </Label>
        </div>
      )}
    </div>
  )
}

