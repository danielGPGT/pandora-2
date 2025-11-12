export interface Venue {
  id: string
  tenant_id: string
  name: string
  slug: string
  venue_type?: string
  city?: string
  country_code?: string
  capacity?: number
  latitude?: number
  longitude?: number
  timezone?: string
  description?: string
  images?: string[] // JSON array of image URLs
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CreateVenueInput {
  name: string
  slug?: string
  venue_type?: string
  city?: string
  country_code?: string
  capacity?: number
  latitude?: number
  longitude?: number
  timezone?: string
  description?: string
  images?: string[]
}

export interface UpdateVenueInput extends Partial<CreateVenueInput> {
  id: string
}

