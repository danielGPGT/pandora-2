'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { venueSchema, type VenueFormData } from '@/lib/validations/venues'
import { useVenues } from '@/lib/hooks/use-venues'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormSection } from '@/components/shared/form-section'
import { SlugInput } from '@/components/shared/slug-input'
import { MultiImageUpload } from '@/components/shared/multi-image-upload'
import { useRouter } from 'next/navigation'
import { Venue } from '@/types/venues'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface VenueFormProps {
  venue?: Venue
  onSuccess?: () => void
}

export function VenueForm({ venue, onSuccess }: VenueFormProps) {
  const { createVenue, updateVenue, isCreating, isUpdating } = useVenues()
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(venueSchema),
    defaultValues: venue ? {
      name: venue.name || '',
      slug: venue.slug || '',
      venue_type: venue.venue_type || '',
      city: venue.city || '',
      country_code: venue.country_code || '',
      capacity: venue.capacity ?? undefined,
      latitude: venue.latitude ?? undefined,
      longitude: venue.longitude ?? undefined,
      timezone: venue.timezone || '',
      description: venue.description || '',
      images: venue.images || [],
    } : {
      name: '',
      slug: '',
      venue_type: '',
      city: '',
      country_code: '',
      capacity: undefined,
      latitude: undefined,
      longitude: undefined,
      timezone: '',
      description: '',
      images: [],
    },
  })

  const onSubmit = async (data: VenueFormData) => {
    if (venue) {
      await updateVenue({ ...data, id: venue.id })
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/setup/venues')
      }
    } else {
      await createVenue(data)
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/setup/venues')
      }
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Basic Information" description="Enter the basic details for this venue">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Wembley Stadium" {...field} />
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="venue_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="stadium">Stadium</SelectItem>
                      <SelectItem value="arena">Arena</SelectItem>
                      <SelectItem value="track">Track</SelectItem>
                      <SelectItem value="circuit">Circuit</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., London" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="country_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="NZ">New Zealand</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="IT">Italy</SelectItem>
                    <SelectItem value="ES">Spain</SelectItem>
                    <SelectItem value="PT">Portugal</SelectItem>
                    <SelectItem value="NL">Netherlands</SelectItem>
                    <SelectItem value="BE">Belgium</SelectItem>
                    <SelectItem value="CH">Switzerland</SelectItem>
                    <SelectItem value="AT">Austria</SelectItem>
                    <SelectItem value="IE">Ireland</SelectItem>
                    <SelectItem value="DK">Denmark</SelectItem>
                    <SelectItem value="SE">Sweden</SelectItem>
                    <SelectItem value="NO">Norway</SelectItem>
                    <SelectItem value="FI">Finland</SelectItem>
                    <SelectItem value="PL">Poland</SelectItem>
                    <SelectItem value="CZ">Czech Republic</SelectItem>
                    <SelectItem value="GR">Greece</SelectItem>
                    <SelectItem value="TR">Turkey</SelectItem>
                    <SelectItem value="RU">Russia</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                    <SelectItem value="CN">China</SelectItem>
                    <SelectItem value="KR">South Korea</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="SG">Singapore</SelectItem>
                    <SelectItem value="MY">Malaysia</SelectItem>
                    <SelectItem value="TH">Thailand</SelectItem>
                    <SelectItem value="ID">Indonesia</SelectItem>
                    <SelectItem value="PH">Philippines</SelectItem>
                    <SelectItem value="VN">Vietnam</SelectItem>
                    <SelectItem value="AE">United Arab Emirates</SelectItem>
                    <SelectItem value="SA">Saudi Arabia</SelectItem>
                    <SelectItem value="IL">Israel</SelectItem>
                    <SelectItem value="ZA">South Africa</SelectItem>
                    <SelectItem value="EG">Egypt</SelectItem>
                    <SelectItem value="KE">Kenya</SelectItem>
                    <SelectItem value="MA">Morocco</SelectItem>
                    <SelectItem value="BR">Brazil</SelectItem>
                    <SelectItem value="AR">Argentina</SelectItem>
                    <SelectItem value="CL">Chile</SelectItem>
                    <SelectItem value="CO">Colombia</SelectItem>
                    <SelectItem value="MX">Mexico</SelectItem>
                    <SelectItem value="CR">Costa Rica</SelectItem>
                    <SelectItem value="JM">Jamaica</SelectItem>
                    <SelectItem value="BS">Bahamas</SelectItem>
                    <SelectItem value="IS">Iceland</SelectItem>
                    <SelectItem value="LU">Luxembourg</SelectItem>
                    <SelectItem value="MT">Malta</SelectItem>
                    <SelectItem value="CY">Cyprus</SelectItem>
                  </SelectContent>
                </Select>
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

        <FormSection title="Location & Capacity" description="Venue location and capacity details">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 90000"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>Maximum seating capacity</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Europe/London" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g., 51.5560"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g., -0.2795"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormSection title="Images" description="Upload up to 5 images for this venue">
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MultiImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    label="Venue Images"
                    bucket="images"
                    folder="venue"
                    maxImages={5}
                    maxSizeMB={5}
                  />
                </FormControl>
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
              onClick={() => router.push('/setup/venues')}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : venue ? 'Update Venue' : 'Create Venue'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

