# CONTEXT
I'm building an enterprise sports event tour operator platform using Next.js 15 (App Router), Supabase, shadcn/ui, Zustand, and TanStack Query. The authentication system is already set up with multi-tenancy via organization_members table. I have a custom DataTable component (data-table-08.tsx) that supports sorting, filtering, bulk actions, and inline editing.

# TASK
Build Phase 1: Foundation & Core Entities module with beautiful, efficient UX/UI including:
1. Complete CRUD operations for 5 entities (Sports, Venues, Teams, Tournaments, Events)
2. Reusable components (page headers, forms, dialogs, empty states)
3. Inline editing capabilities
4. Audit logging for all changes
5. Duplicate functionality
6. Image upload handling
7. Advanced search and filtering
8. Responsive design
9. Loading states and error handling
10. Success/error notifications

# TECH STACK
- Next.js 15 (App Router)
- TypeScript
- Supabase (Database + Storage)
- shadcn/ui + Tailwind CSS
- Zustand (state management)
- TanStack Query (data fetching)
- React Hook Form + Zod (forms)
- date-fns (date handling)
- Custom DataTable08 component (already exists)

# REQUIREMENTS

## 1. FOLDER STRUCTURE

Create this exact structure:
```
src/
├── app/
│   └── (dashboard)/
│       ├── dashboard/
│       │   └── page.tsx
│       └── setup/
│           ├── sports/
│           │   ├── page.tsx
│           │   ├── new/
│           │   │   └── page.tsx
│           │   └── [id]/
│           │       ├── page.tsx
│           │       └── edit/
│           │           └── page.tsx
│           ├── venues/
│           │   └── [same structure]
│           ├── teams/
│           │   └── [same structure]
│           ├── tournaments/
│           │   └── [same structure]
│           └── events/
│               └── [same structure]
├── components/
│   ├── setup/
│   │   ├── sports/
│   │   │   ├── sports-table.tsx
│   │   │   ├── sport-form.tsx
│   │   │   ├── sport-card.tsx
│   │   │   ├── delete-sport-dialog.tsx
│   │   │   └── duplicate-sport-dialog.tsx
│   │   ├── venues/
│   │   │   └── [similar components]
│   │   ├── teams/
│   │   │   └── [similar components]
│   │   ├── tournaments/
│   │   │   └── [similar components]
│   │   └── events/
│   │       └── [similar components]
│   └── shared/
│       ├── page-header.tsx
│       ├── page-loading.tsx
│       ├── empty-state.tsx
│       ├── image-upload.tsx
│       ├── slug-input.tsx
│       ├── status-badge.tsx
│       ├── audit-log.tsx
│       ├── delete-dialog.tsx
│       ├── form-section.tsx
│       └── back-button.tsx
├── lib/
│   ├── api/
│   │   ├── sports.ts
│   │   ├── venues.ts
│   │   ├── teams.ts
│   │   ├── tournaments.ts
│   │   ├── events.ts
│   │   └── audit-logs.ts
│   ├── validations/
│   │   ├── sports.ts
│   │   ├── venues.ts
│   │   ├── teams.ts
│   │   ├── tournaments.ts
│   │   └── events.ts
│   └── hooks/
│       ├── use-sports.ts
│       ├── use-venues.ts
│       ├── use-teams.ts
│       ├── use-tournaments.ts
│       ├── use-events.ts
│       └── use-audit-logs.ts
├── types/
│   ├── sports.ts
│   ├── venues.ts
│   ├── teams.ts
│   ├── tournaments.ts
│   ├── events.ts
│   └── audit.ts
└── stores/
    └── ui-store.ts (already exists)
```

---

## 2. DATABASE SETUP

### Create Audit Log Table
```sql
-- Add audit_logs table for tracking all changes
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  entity_type character varying NOT NULL, -- 'sport', 'venue', 'team', etc.
  entity_id uuid NOT NULL,
  action character varying NOT NULL, -- 'created', 'updated', 'deleted', 'duplicated'
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view audit logs for their organization
CREATE POLICY "Users can view org audit logs"
ON audit_logs FOR SELECT
USING (
  tenant_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);
```

### Create Storage Bucket for Images
```sql
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('setup-images', 'setup-images', true);

-- Policy: Users can upload images for their organization
CREATE POLICY "Users can upload org images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'setup-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM tenants WHERE id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Anyone can view public images
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'setup-images');
```

---

## 3. SHARED COMPONENTS

### components/shared/page-header.tsx
```typescript
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  action?: ReactNode
}

export function PageHeader({ title, description, backHref, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {backHref && (
          <Link href={backHref}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
```

### components/shared/empty-state.tsx
```typescript
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

### components/shared/page-loading.tsx
```typescript
import { Skeleton } from '@/components/ui/skeleton'

export function PageLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}
```

### components/shared/status-badge.tsx
```typescript
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  isActive: boolean
  activeLabel?: string
  inactiveLabel?: string
}

export function StatusBadge({ 
  isActive, 
  activeLabel = 'Active', 
  inactiveLabel = 'Inactive' 
}: StatusBadgeProps) {
  return (
    <Badge
      variant={isActive ? 'success' : 'secondary'}
      className={cn(
        isActive ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20' : ''
      )}
    >
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  )
}
```

### components/shared/image-upload.tsx
```typescript
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
```

### components/shared/slug-input.tsx
```typescript
'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'

interface SlugInputProps {
  value: string
  onChange: (value: string) => void
  sourceValue?: string
  label?: string
  placeholder?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function SlugInput({ 
  value, 
  onChange, 
  sourceValue, 
  label = 'Slug',
  placeholder = 'auto-generated'
}: SlugInputProps) {
  useEffect(() => {
    if (sourceValue && !value) {
      onChange(slugify(sourceValue))
    }
  }, [sourceValue, value, onChange])

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(slugify(e.target.value))}
        placeholder={placeholder}
      />
      <p className="text-xs text-muted-foreground">
        Used in URLs. Auto-generated from name if left blank.
      </p>
    </div>
  )
}
```

### components/shared/delete-dialog.tsx
```typescript
'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  isLoading?: boolean
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone. This will permanently delete this item.',
  isLoading = false
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### components/shared/audit-log.tsx
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/lib/api/audit-logs'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AuditLogProps {
  entityType: string
  entityId: string
}

export function AuditLog({ entityType, entityId }: AuditLogProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', entityType, entityId],
    queryFn: () => getAuditLogs(entityType, entityId),
  })

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading audit log...</div>
  }

  if (!logs?.length) {
    return <div className="text-sm text-muted-foreground">No activity yet</div>
  }

  return (
    <ScrollArea className="h-[400px] rounded-lg border p-4">
      <div className="space-y-4">
        {logs.map((log: any) => (
          <div key={log.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {log.user_email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{log.user_email}</span>
                <Badge variant="outline" className="text-xs">
                  {log.action}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </p>
              {log.action === 'updated' && log.old_values && log.new_values && (
                <div className="mt-2 rounded bg-muted p-2 text-xs">
                  {Object.keys(log.new_values).map((key) => {
                    if (log.old_values[key] !== log.new_values[key]) {
                      return (
                        <div key={key} className="font-mono">
                          <span className="text-muted-foreground">{key}:</span>{' '}
                          <span className="line-through text-red-500">
                            {String(log.old_values[key])}
                          </span>{' '}
                          → <span className="text-green-500">{String(log.new_values[key])}</span>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
```

### components/shared/form-section.tsx
```typescript
import { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator />
      <div className="space-y-4">{children}</div>
    </div>
  )
}
```

---

## 4. TYPES

### types/sports.ts
```typescript
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
```

### types/audit.ts
```typescript
export interface AuditLog {
  id: string
  tenant_id: string
  user_id: string
  user_email?: string
  entity_type: string
  entity_id: string
  action: 'created' | 'updated' | 'deleted' | 'duplicated'
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  created_at: string
}
```

---

## 5. VALIDATIONS

### lib/validations/sports.ts
```typescript
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
```

---

## 6. API FUNCTIONS

### lib/api/sports.ts
```typescript
import { createClient } from '@/lib/supabase/client'
import type { Sport, CreateSportInput, UpdateSportInput } from '@/types/sports'
import { logAuditAction } from './audit-logs'

export async function getSports(tenantId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data as Sport[]
}

export async function getSport(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as Sport
}

export async function createSport(input: CreateSportInput, tenantId: string) {
  const supabase = createClient()
  
  // Auto-generate slug if not provided
  const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-')
  
  const { data, error } = await supabase
    .from('sports')
    .insert({ ...input, slug, tenant_id: tenantId })
    .select()
    .single()

  if (error) throw error

  // Log audit
  await logAuditAction({
    entityType: 'sport',
    entityId: data.id,
    action: 'created',
    newValues: data,
  })

  return data as Sport
}

export async function updateSport(input: UpdateSportInput) {
  const supabase = createClient()
  
  const { id, ...updates } = input
  
  // Get old values for audit
  const { data: oldData } = await supabase
    .from('sports')
    .select('*')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('sports')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Log audit
  await logAuditAction({
    entityType: 'sport',
    entityId: id,
    action: 'updated',
    oldValues: oldData,
    newValues: data,
  })

  return data as Sport
}

export async function deleteSport(id: string) {
  const supabase = createClient()
  
  // Soft delete
  const { error } = await supabase
    .from('sports')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  // Log audit
  await logAuditAction({
    entityType: 'sport',
    entityId: id,
    action: 'deleted',
  })
}

export async function duplicateSport(id: string, tenantId: string) {
  const supabase = createClient()
  
  const { data: original, error: fetchError } = await supabase
    .from('sports')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  // Create copy with modified name
  const { id: _id, created_at, updated_at, ...copyData } = original
  const { data, error } = await supabase
    .from('sports')
    .insert({
      ...copyData,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
    })
    .select()
    .single()

  if (error) throw error

  // Log audit
  await logAuditAction({
    entityType: 'sport',
    entityId: data.id,
    action: 'duplicated',
    newValues: { original_id: id },
  })

  return data as Sport
}

export async function bulkDeleteSports(ids: string[]) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('sports')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', ids)

  if (error) throw error

  // Log audits
  for (const id of ids) {
    await logAuditAction({
      entityType: 'sport',
      entityId: id,
      action: 'deleted',
    })
  }
}

export async function bulkUpdateSportsStatus(ids: string[], isActive: boolean) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('sports')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .in('id', ids)

  if (error) throw error
}
```

### lib/api/audit-logs.ts
```typescript
import { createClient } from '@/lib/supabase/client'
import type { AuditLog } from '@/types/audit'

interface LogAuditActionInput {
  entityType: string
  entityId: string
  action: 'created' | 'updated' | 'deleted' | 'duplicated'
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
}

export async function logAuditAction({
  entityType,
  entityId,
  action,
  oldValues,
  newValues,
}: LogAuditActionInput) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: orgMember } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!orgMember) return

  await supabase.from('audit_logs').insert({
    tenant_id: orgMember.organization_id,
    user_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    action,
    old_values: oldValues,
    new_values: newValues,
  })
}

export async function getAuditLogs(entityType: string, entityId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user:user_id (
        email
      )
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  return data.map(log => ({
    ...log,
    user_email: (log.user as any)?.email
  })) as AuditLog[]
}
```

---

## 7. CUSTOM HOOKS

### lib/hooks/use-sports.ts
```typescript
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useOrganization } from './use-organization'
import { useToast } from '@/hooks/use-toast'
import * as api from '@/lib/api/sports'
import type { CreateSportInput, UpdateSportInput } from '@/types/sports'

export function useSports() {
  const { currentOrg } = useOrganization()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: sports, isLoading } = useQuery({
    queryKey: ['sports', currentOrg?.id],
    queryFn: () => api.getSports(currentOrg!.id),
    enabled: !!currentOrg,
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateSportInput) => api.createSport(input, currentOrg!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] })
      toast({ title: 'Success', description: 'Sport created successfully' })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: UpdateSportInput) => api.updateSport(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] })
      toast({ title: 'Success', description: 'Sport updated successfully' })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteSport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] })
      toast({ title: 'Success', description: 'Sport deleted successfully' })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.duplicateSport(id, currentOrg!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] })
      toast({ title: 'Success', description: 'Sport duplicated successfully' })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  return {
    sports,
    isLoading,
    createSport: createMutation.mutate,
    updateSport: updateMutation.mutate,
    deleteSport: deleteMutation.mutate,
    duplicateSport: duplicateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  }
}

export function useSport(id: string) {
  const { data: sport, isLoading } = useQuery({
    queryKey: ['sport', id],
    queryFn: () => api.getSport(id),
    enabled: !!id,
  })

  return { sport, isLoading }
}
```

---

## 8. SPORTS MODULE IMPLEMENTATION

### app/(dashboard)/setup/sports/page.tsx
```typescript
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { PageLoading } from '@/components/shared/page-loading'
import { SportsTable } from '@/components/setup/sports/sports-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function SportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sports"
        description="Manage sports for your events"
        action={
          <Link href="/setup/sports/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Sport
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<PageLoading />}>
        <SportsTable />
      </Suspense>
    </div>
  )
}
```

### components/setup/sports/sports-table.tsx
```typescript
'use client'

import { DataTable08 } from '@/components/data-table-08'
import { useSports } from '@/lib/hooks/use-sports'
import { ColumnDef } from '@tanstack/react-table'
import { Sport } from '@/types/sports'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Copy, Eye } from 'lucide-react'
import { useState } from 'react'
import { DeleteDialog } from '@/components/shared/delete-dialog'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { EmptyState } from '@/components/shared/empty-state'
import { Trophy } from 'lucide-react'
import * as api from '@/lib/api/sports'
import { useOrganization } from '@/lib/hooks/use-organization'

export function SportsTable() {
  const { sports, isLoading, deleteSport, duplicateSport } = useSports()
  const { currentOrg } = useOrganization()
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const columns: ColumnDef<Sport>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.icon_url && (
            <div className="relative h-8 w-8 rounded-md overflow-hidden">
              <Image
                src={row.original.icon_url}
                alt={row.original.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => <StatusBadge isActive={row.original.is_active} />,
    },
    {
      accessorKey: 'sort_order',
      header: 'Order',
      cell: ({ row }) => row.original.sort_order,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/setup/sports/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/setup/sports/${row.original.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateSport(row.original.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!sports?.length) {
    return (
      <EmptyState
        icon={Trophy}
        title="No sports yet"
        description="Get started by creating your first sport"
        action={{
          label: 'Add Sport',
          onClick: () => router.push('/setup/sports/new'),
        }}
      />
    )
  }

  return (
    <>
      <DataTable08
        data={sports}
        columns={columns}
        enableRowSelection
        enableSearch
        enableExport
        enableColumnVisibility
        searchPlaceholder="Search sports..."
        exportFilename="sports.csv"
        storageKey="sports-table"
        onBulkDelete={async (selected) => {
          const ids = selected.map((s: Sport) => s.id)
          await api.bulkDeleteSports(ids)
        }}
        onBulkStatusChange={async (selected, status) => {
          const ids = selected.map((s: Sport) => s.id)
          await api.bulkUpdateSportsStatus(ids, status)
        }}
        onBulkDuplicate={async (selected) => {
          for (const sport of selected) {
            await api.duplicateSport(sport.id, currentOrg!.id)
          }
        }}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteSport(deleteId)
            setDeleteId(null)
          }
        }}
        title="Delete Sport"
        description="Are you sure you want to delete this sport? This action cannot be undone."
      />
    </>
  )
}
```

### app/(dashboard)/setup/sports/new/page.tsx
```typescript
import { PageHeader } from '@/components/shared/page-header'
import { SportForm } from '@/components/setup/sports/sport-form'

export default function NewSportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Sport"
        description="Add a new sport to your system"
        backHref="/setup/sports"
      />
      <div className="max-w-2xl">
        <SportForm />
      </div>
    </div>
  )
}
```

### components/setup/sports/sport-form.tsx
```typescript
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
}

export function SportForm({ sport }: SportFormProps) {
  const { createSport, updateSport, isCreating, isUpdating } = useSports()
  const router = useRouter()

  const form = useForm<SportFormData>({
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
      router.push('/setup/sports')
    } else {
      createSport(data)
      router.push('/setup/sports')
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
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
                    <FormLabel>Slug</FormLabel>
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/setup/sports')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : sport ? 'Update Sport' : 'Create Sport'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

### app/(dashboard)/setup/sports/[id]/page.tsx
```typescript
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { PageLoading } from '@/components/shared/page-loading'
import { Button } from '@/components/ui/button'
import { Edit, Copy } from 'lucide-react'
import Link from 'next/link'
import { SportDetails } from '@/components/setup/sports/sport-details'

export default function SportDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sport Details"
        backHref="/setup/sports"
        action={
          <div className="flex gap-2">
            <Link href={`/setup/sports/${params.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />
      <Suspense fallback={<PageLoading />}>
        <SportDetails id={params.id} />
      </Suspense>
    </div>
  )
}
```

### components/setup/sports/sport-details.tsx
```typescript
'use client'

import { useSport } from '@/lib/hooks/use-sports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import Image from 'next/image'
import { AuditLog } from '@/components/shared/audit-log'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SportDetails({ id }: { id: string }) {
  const { sport, isLoading } = useSport(id)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!sport) {
    return <div>Sport not found</div>
  }

  return (
    <Tabs defaultValue="details" className="space-y-6">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{sport.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Slug</p>
                <code className="text-sm bg-muted px-2 py-1 rounded">{sport.slug}</code>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <StatusBadge isActive={sport.is_active} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sort Order</p>
                <p>{sport.sort_order}</p>
              </div>
            </div>

            {sport.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{sport.description}</p>
              </div>
            )}

            <div className="flex gap-4">
              {sport.icon_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Icon</p>
                  <div className="relative h-16 w-16 rounded-lg border overflow-hidden">
                    <Image src={sport.icon_url} alt="Icon" fill className="object-cover" />
                  </div>
                </div>
              )}
              {sport.image_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Featured Image</p>
                  <div className="relative h-32 w-48 rounded-lg border overflow-hidden">
                    <Image src={sport.image_url} alt="Featured" fill className="object-cover" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity">
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditLog entityType="sport" entityId={id} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
```

### app/(dashboard)/setup/sports/[id]/edit/page.tsx
```typescript
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { PageLoading } from '@/components/shared/page-loading'
import { SportForm } from '@/components/setup/sports/sport-form'
import { SportEditWrapper } from '@/components/setup/sports/sport-edit-wrapper'

export default function EditSportPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Sport"
        backHref={`/setup/sports/${params.id}`}
      />
      <div className="max-w-2xl">
        <Suspense fallback={<PageLoading />}>
          <SportEditWrapper id={params.id} />
        </Suspense>
      </div>
    </div>
  )
}
```

### components/setup/sports/sport-edit-wrapper.tsx
```typescript
'use client'

import { useSport } from '@/lib/hooks/use-sports'
import { SportForm } from './sport-form'

export function SportEditWrapper({ id }: { id: string }) {
  const { sport, isLoading } = useSport(id)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!sport) {
    return <div>Sport not found</div>
  }

  return <SportForm sport={sport} />
}
```

---

## 9. UPDATE SIDEBAR NAVIGATION

### components/layouts/sidebar.tsx

Update the navigation array to include Setup section:
```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Setup',
    icon: Settings,
    children: [
      { name: 'Sports', href: '/setup/sports', icon: Trophy },
      { name: 'Venues', href: '/setup/venues', icon: MapPin },
      { name: 'Teams', href: '/setup/teams', icon: Users },
      { name: 'Tournaments', href: '/setup/tournaments', icon: Award },
      { name: 'Events', href: '/setup/events', icon: Calendar },
    ]
  },
  // ... rest of navigation
]
```

---

## 10. EXECUTION STEPS

1. **Create audit_logs table and storage bucket** (run SQL from section 2)
2. **Create folder structure** exactly as specified
3. **Create all shared components** (page-header, empty-state, etc.)
4. **Create types** for Sport and AuditLog
5. **Create validation schemas** with Zod
6. **Create API functions** with audit logging
7. **Create custom hooks** (use-sports)
8. **Implement Sports module** (all pages and components)
9. **Update sidebar navigation** to include Setup section
10. **Test all functionality**: create, read, update, delete, duplicate

---

## 11. SIMILAR PATTERN FOR OTHER ENTITIES

After Sports is working, replicate the same pattern for:
- Venues (with map integration, country selector)
- Teams (with sport filter)
- Tournaments (with sport and season filters)
- Events (complex form with multiple dependencies)

Each entity follows the same structure:
- Types → Validations → API → Hooks → Components → Pages

---

## 12. VALIDATION CRITERIA

**Phase 1 is complete when:**
- [ ] Can create, view, edit, delete all 5 entities
- [ ] Bulk actions work (delete, status change, duplicate)
- [ ] Images upload successfully to Supabase Storage
- [ ] Audit logs capture all changes
- [ ] Search and filters work
- [ ] Inline editing works (via table)
- [ ] Slugs auto-generate
- [ ] Multi-tenancy enforced (all queries filter by tenant_id)
- [ ] Forms validate properly with Zod
- [ ] Loading states show appropriately
- [ ] Success/error toasts display
- [ ] Responsive on mobile
- [ ] No TypeScript errors
- [ ] No console errors

---

## ADDITIONAL NOTES

- Use the existing DataTable08 component for all list views
- All API calls should include tenant_id from current organization
- All forms should use React Hook Form + Zod validation
- All mutations should use TanStack Query with optimistic updates
- All images should be stored in Supabase Storage with proper folder structure
- All changes should be logged to audit_logs table
- Follow the established patterns for consistency

**Ready to build! This will give you a solid, production-ready foundation for Phase 1.** 🚀