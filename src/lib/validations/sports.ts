import { z } from 'zod'

export const sportSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().optional(),
  icon_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
})

export type SportFormData = z.infer<typeof sportSchema>

