-- Add tenant_id to sports table if it doesn't exist
ALTER TABLE public.sports 
ADD COLUMN IF NOT EXISTS tenant_id uuid;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'sports_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.sports
    ADD CONSTRAINT sports_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);
  END IF;
END $$;

-- Update existing sports to have a tenant_id (if any exist)
-- This is a placeholder - you'll need to set actual tenant_id values
-- UPDATE public.sports SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;

