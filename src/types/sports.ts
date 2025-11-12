export interface Sport {
  id: string
  tenant_id: string
  name: string
  slug: string
  icon_url?: string
  image_url?: string
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CreateSportInput {
  name: string
  slug?: string
  icon_url?: string
  image_url?: string
  description?: string
  is_active?: boolean
  sort_order?: number
}

export interface UpdateSportInput extends Partial<CreateSportInput> {
  id: string
}

