import { createClient } from '@/lib/supabase/client'
import type { Venue, CreateVenueInput, UpdateVenueInput } from '@/types/venues'
import { logAuditAction } from './audit-logs'
import { slugify, generateUniqueSlug, isValidSlug, generateUniqueName } from '@/lib/utils/slug'
import { sanitizeObject, sanitizeText } from '@/lib/utils/sanitize'

export async function getVenues(tenantId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw error
  return data as Venue[]
}

export async function getVenue(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as Venue
}

export async function createVenue(input: CreateVenueInput, tenantId: string) {
  const supabase = createClient()
  
  // Sanitize input to prevent XSS
  const sanitizedInput = sanitizeObject(input, {
    name: 'text',
    slug: 'text',
    venue_type: 'text',
    city: 'text',
    description: 'richText',
  })
  
  // Validate and generate slug
  let slug = sanitizedInput.slug || slugify(sanitizedInput.name)
  
  // Validate slug format
  if (!isValidSlug(slug)) {
    throw new Error('Invalid slug format. Slug must be lowercase alphanumeric with hyphens.')
  }
  
  // Get all existing venues for this tenant to check for collisions
  const { data: existingVenues } = await supabase
    .from('venues')
    .select('name, slug')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
  
  if (existingVenues && existingVenues.length > 0) {
    const existingNames = existingVenues.map(s => s.name)
    const existingSlugs = existingVenues.map(s => s.slug)
    
    // Check and fix name collision
    if (existingNames.includes(sanitizedInput.name)) {
      sanitizedInput.name = generateUniqueName(sanitizedInput.name, existingNames)
    }
    
    // Check and fix slug collision
    if (existingSlugs.includes(slug)) {
      slug = generateUniqueSlug(slug, existingSlugs)
    }
  }
  
  const { data, error } = await supabase
    .from('venues')
    .insert({ ...sanitizedInput, slug, tenant_id: tenantId })
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      if (error.message.includes('name') || error.message.includes('venues_name_key')) {
        throw new Error('A venue with this name already exists. Please use a different name.')
      }
      if (error.message.includes('slug') || error.message.includes('venues_tenant_slug_unique')) {
        throw new Error('A venue with this slug already exists. Please use a different slug.')
      }
      throw new Error('A venue with this name or slug already exists. Please use different values.')
    }
    throw error
  }

  // Log audit
  await logAuditAction({
    entityType: 'venue',
    entityId: data.id,
    action: 'created',
    newValues: data,
  })

  return data as Venue
}

export async function updateVenue(input: UpdateVenueInput) {
  const supabase = createClient()
  
  const { id, ...updates } = input
  
  // Sanitize input to prevent XSS
  const sanitizedUpdates = sanitizeObject(updates, {
    name: 'text',
    slug: 'text',
    venue_type: 'text',
    city: 'text',
    description: 'richText',
  })
  
  // Get old values for audit and tenant_id
  const { data: oldData, error: fetchError } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError
  if (!oldData) throw new Error('Venue not found')

  const tenantId = oldData.tenant_id

  // Get all existing venues for this tenant (excluding current venue) to check for collisions
  const { data: existingVenues } = await supabase
    .from('venues')
    .select('name, slug')
    .eq('tenant_id', tenantId)
    .neq('id', id)
    .is('deleted_at', null)

  if (existingVenues && existingVenues.length > 0) {
    const existingNames = existingVenues.map(s => s.name)
    const existingSlugs = existingVenues.map(s => s.slug)

    // If name is being updated, validate and check for collisions
    if (sanitizedUpdates.name !== undefined) {
      if (existingNames.includes(sanitizedUpdates.name)) {
        throw new Error('A venue with this name already exists. Please use a different name.')
      }
    }

    // If slug is being updated, validate and check for collisions
    if (sanitizedUpdates.slug !== undefined && sanitizedUpdates.slug !== null) {
      let slug = sanitizedUpdates.slug
      
      // Validate slug format
      if (!isValidSlug(slug)) {
        throw new Error('Invalid slug format. Slug must be lowercase alphanumeric with hyphens.')
      }
      
      if (existingSlugs.includes(slug)) {
        throw new Error('A venue with this slug already exists. Please use a different slug.')
      }
      
      sanitizedUpdates.slug = slug
    }
  }

  const { data, error } = await supabase
    .from('venues')
    .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      if (error.message.includes('name') || error.message.includes('venues_name_key')) {
        throw new Error('A venue with this name already exists. Please use a different name.')
      }
      if (error.message.includes('slug') || error.message.includes('venues_tenant_slug_unique')) {
        throw new Error('A venue with this slug already exists. Please use a different slug.')
      }
      throw new Error('A venue with this name or slug already exists. Please use different values.')
    }
    throw error
  }

  // Log audit
  await logAuditAction({
    entityType: 'venue',
    entityId: id,
    action: 'updated',
    oldValues: oldData,
    newValues: data,
  })

  return data as Venue
}

export async function deleteVenue(id: string) {
  const supabase = createClient()
  
  // Soft delete
  const { error } = await supabase
    .from('venues')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  // Log audit
  await logAuditAction({
    entityType: 'venue',
    entityId: id,
    action: 'deleted',
  })
}

export async function duplicateVenue(id: string, tenantId: string) {
  const supabase = createClient()
  
  const { data: original, error: fetchError } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  // Get all existing names and slugs for this tenant to check for collisions
  const { data: existingVenues } = await supabase
    .from('venues')
    .select('name, slug')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)

  const existingNames = existingVenues?.map(s => s.name) || []
  const existingSlugs = existingVenues?.map(s => s.slug) || []

  // Generate unique name FIRST (before sanitization to preserve the pattern)
  // Always add (Copy) suffix for duplicates
  let uniqueName = generateUniqueName(original.name, existingNames, 'Copy')
  
  // Generate unique slug
  const baseSlug = slugify(original.slug) || slugify(original.name)
  const uniqueSlug = generateUniqueSlug(`${baseSlug}-copy`, existingSlugs)

  // Sanitize the copy data (but preserve our generated unique name)
  const { id: _id, created_at, updated_at, deleted_at, tenant_id, ...copyData } = original
  const sanitizedCopy = sanitizeObject(copyData, {
    name: 'skip', // Skip sanitization for name since we're setting it manually
    slug: 'skip', // Skip sanitization for slug since we're setting it manually
    venue_type: 'text',
    city: 'text',
    description: 'richText',
  })

  // Sanitize the unique name separately (but keep the Copy pattern)
  let sanitizedUniqueName = sanitizeText(uniqueName)

  // Create copy with unique name and slug
  // Retry logic in case of race condition
  let attempts = 0
  const maxAttempts = 3
  let data, error

  while (attempts < maxAttempts) {
    const { data: attemptData, error: attemptError } = await supabase
      .from('venues')
      .insert({
        ...sanitizedCopy,
        name: sanitizedUniqueName,
        slug: uniqueSlug,
        tenant_id: tenantId,
      })
      .select()
      .single()

    data = attemptData
    error = attemptError

    if (!error) break

    // If it's a unique constraint violation, regenerate and retry
    if (error.code === '23505' && attempts < maxAttempts - 1) {
      // Regenerate unique name with updated existing names
      const { data: updatedExisting } = await supabase
        .from('venues')
        .select('name')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
      
      const updatedNames = updatedExisting?.map(s => s.name) || []
      uniqueName = generateUniqueName(original.name, updatedNames, 'Copy')
      sanitizedUniqueName = sanitizeText(uniqueName)
      attempts++
      continue
    }

    break
  }

  if (error) {
    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.message.includes('name') || error.message.includes('venues_name_key')) {
        throw new Error(`A venue with the name "${sanitizedUniqueName}" already exists. Please try again.`)
      }
      if (error.message.includes('slug') || error.message.includes('venues_tenant_slug_unique')) {
        throw new Error('A venue with this slug already exists. Please try again.')
      }
      throw new Error('A venue with this name or slug already exists. Please try again.')
    }
    throw error
  }

  if (!data) {
    throw new Error('Failed to duplicate venue after multiple attempts.')
  }

  // Log audit
  await logAuditAction({
    entityType: 'venue',
    entityId: data.id,
    action: 'duplicated',
    newValues: { original_id: id },
  })

  return data as Venue
}

export async function bulkDeleteVenues(ids: string[]) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('venues')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', ids)

  if (error) throw error

  // Log audits
  for (const id of ids) {
    await logAuditAction({
      entityType: 'venue',
      entityId: id,
      action: 'deleted',
    })
  }
}

// Note: Venues don't have is_active field, so bulk status update is not applicable
// This function is kept for API consistency but should not be called

