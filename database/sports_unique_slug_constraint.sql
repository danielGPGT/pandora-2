-- Add unique constraint on (tenant_id, slug) for sports table
-- This ensures slugs are unique per tenant at the database level

-- First, remove any duplicate slugs within the same tenant (if any exist)
-- This is a safety measure before adding the constraint
DO $$
DECLARE
  duplicate_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR duplicate_record IN
    SELECT tenant_id, slug, COUNT(*) as count
    FROM public.sports
    WHERE slug IS NOT NULL AND deleted_at IS NULL
    GROUP BY tenant_id, slug
    HAVING COUNT(*) > 1
  LOOP
    -- Update duplicates with a numbered suffix
    UPDATE public.sports
    SET slug = slug || '-' || counter
    WHERE tenant_id = duplicate_record.tenant_id
      AND slug = duplicate_record.slug
      AND deleted_at IS NULL
      AND id NOT IN (
        SELECT id FROM public.sports
        WHERE tenant_id = duplicate_record.tenant_id
          AND slug = duplicate_record.slug
          AND deleted_at IS NULL
        ORDER BY created_at ASC
        LIMIT 1
      );
    counter := counter + 1;
  END LOOP;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'sports_tenant_slug_unique'
  ) THEN
    ALTER TABLE public.sports
    ADD CONSTRAINT sports_tenant_slug_unique 
    UNIQUE (tenant_id, slug);
  END IF;
END $$;

-- Add index for faster lookups (unique constraint already creates an index, but this is explicit)
CREATE INDEX IF NOT EXISTS idx_sports_tenant_slug 
ON public.sports(tenant_id, slug) 
WHERE deleted_at IS NULL;

