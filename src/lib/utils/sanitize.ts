/**
 * Input sanitization utilities for XSS prevention
 */

/**
 * Sanitizes a string by removing potentially dangerous HTML/script tags
 * For simple text fields, we just escape HTML entities
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Sanitizes a string but allows basic formatting (for descriptions)
 * Removes script tags and dangerous attributes
 */
export function sanitizeRichText(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  return sanitized.trim()
}

/**
 * Sanitizes a URL to prevent XSS via href/src attributes
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return ''
  
  // Remove javascript: and data: protocols
  const dangerousProtocols = /^(javascript|data|vbscript):/i
  if (dangerousProtocols.test(url)) {
    return ''
  }
  
  // Allow http, https, and relative URLs
  const safeProtocols = /^(https?:\/\/|\/)/i
  if (!safeProtocols.test(url) && url.trim() !== '') {
    return ''
  }
  
  return url.trim()
}

/**
 * Sanitizes an object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, fields: {
  [K in keyof T]?: 'text' | 'richText' | 'url' | 'skip'
}): T {
  const sanitized = { ...obj } as any
  
  for (const [key, value] of Object.entries(sanitized)) {
    const fieldType = fields[key as keyof T] || 'text'
    
    if (fieldType === 'skip') continue
    
    if (typeof value === 'string') {
      switch (fieldType) {
        case 'text':
          sanitized[key] = sanitizeText(value)
          break
        case 'richText':
          sanitized[key] = sanitizeRichText(value)
          break
        case 'url':
          sanitized[key] = sanitizeUrl(value)
          break
      }
    }
  }
  
  return sanitized as T
}

