/**
 * Utility functions for slug generation and collision handling
 */

/**
 * Converts a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a number if collision occurs
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let counter = 1
  let uniqueSlug = `${baseSlug}-${counter}`

  while (existingSlugs.includes(uniqueSlug)) {
    counter++
    uniqueSlug = `${baseSlug}-${counter}`
  }

  return uniqueSlug
}

/**
 * Validates if a slug is valid format
 */
export function isValidSlug(slug: string): boolean {
  // Slug should be lowercase, alphanumeric with hyphens, 1-100 chars
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 100
}

/**
 * Generates a unique name by appending a number if collision occurs
 * @param baseName - The base name to make unique
 * @param existingNames - Array of existing names to check against
 * @param suffix - Optional suffix to add before the number (default: "Copy")
 * @returns A unique name
 */
export function generateUniqueName(
  baseName: string,
  existingNames: string[],
  suffix: string = 'Copy'
): string {
  // Try with suffix first
  let candidateName = `${baseName} (${suffix})`
  
  if (!existingNames.includes(candidateName)) {
    return candidateName
  }

  // If that exists, try with numbers
  let counter = 1
  candidateName = `${baseName} (${suffix} ${counter})`

  while (existingNames.includes(candidateName)) {
    counter++
    candidateName = `${baseName} (${suffix} ${counter})`
  }

  return candidateName
}

