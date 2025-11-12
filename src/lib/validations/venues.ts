import { z } from 'zod'

export const venueSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().optional(),
  venue_type: z.string().optional(),
  city: z.string().optional(),
  country_code: z.string().optional(),
  capacity: z.number().int().min(0).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional().default([]),
})

export type VenueFormData = z.infer<typeof venueSchema>

