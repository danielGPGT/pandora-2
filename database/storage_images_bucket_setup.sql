-- Create storage bucket for images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload org images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to venue folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view venue images" ON storage.objects;

-- Policy: Users can upload images to their organization's folder
-- This policy checks organization membership without causing recursion
CREATE POLICY "Users can upload to venue folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  -- Check if the folder path starts with a valid organization ID
  -- Format: {org_id}/venue/{filename}
  (storage.foldername(name))[1] IN (
    SELECT id::text
    FROM tenants
    WHERE id IN (
      -- Use a simple subquery to avoid recursion
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Anyone can view public images
CREATE POLICY "Anyone can view images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Policy: Users can delete images from their organization's folder
CREATE POLICY "Users can delete org images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text
    FROM tenants
    WHERE id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Users can update images from their organization's folder
CREATE POLICY "Users can update org images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text
    FROM tenants
    WHERE id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

