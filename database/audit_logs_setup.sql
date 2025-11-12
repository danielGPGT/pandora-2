-- Audit Logs Table for tracking all changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

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

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('setup-images', 'setup-images', true)
ON CONFLICT (id) DO NOTHING;

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

