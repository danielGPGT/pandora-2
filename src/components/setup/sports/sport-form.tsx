'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sportSchema, type SportFormData } from '@/lib/validations/sports'
import { useSports } from '@/lib/hooks/use-sports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { FormSection } from '@/components/shared/form-section'
import { ImageUpload } from '@/components/shared/image-upload'
import { SlugInput } from '@/components/shared/slug-input'
import { useRouter } from 'next/navigation'
import { Sport } from '@/types/sports'

interface SportFormProps {
  sport?: Sport
  onSuccess?: () => void
}

export function SportForm({ sport, onSuccess }: SportFormProps) {
  const { createSport, updateSport, isCreating, isUpdating } = useSports()
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(sportSchema),
    defaultValues: sport || {
      name: '',
      slug: '',
      icon_url: '',
      image_url: '',
      description: '',
      is_active: true,
      sort_order: 0,
    },
  })

  const onSubmit = async (data: SportFormData) => {
    if (sport) {
      updateSport({ ...data, id: sport.id })
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/setup/sports')
      }
    } else {
      createSport(data)
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/setup/sports')
      }
    }
  }


  const isLoading = isCreating || isUpdating

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <FormSection title="Basic Information" description="Enter the basic details for this sport">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Football" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SlugInput
                        value={field.value || ''}
                        onChange={field.onChange}
                        sourceValue={form.watch('name')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Images" description="Upload images for this sport">
              <FormField
                control={form.control}
                name="icon_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        label="Icon"
                        value={field.value}
                        onChange={field.onChange}
                        folder="sports/icons"
                      />
                    </FormControl>
                    <FormDescription>
                      Small icon used in menus and lists (recommended: 64x64px)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        label="Featured Image"
                        value={field.value}
                        onChange={field.onChange}
                        folder="sports/images"
                      />
                    </FormControl>
                    <FormDescription>
                      Main image for the sport (recommended: 1200x630px)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Settings" description="Configure display and ordering">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Make this sport visible in the system
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first in lists
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>


        <div className="flex justify-end gap-3">
          {!onSuccess && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/setup/sports')}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : sport ? 'Update Sport' : 'Create Sport'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

