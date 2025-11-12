-- Create storage bucket for images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload org images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to venue folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view venue images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete org images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update org images" ON storage.objects;

-- Policy: Users can upload images to their organization's folder
-- Using a function to avoid RLS recursion issues
CREATE OR REPLACE FUNCTION check_user_org_membership(user_uuid uuid, org_id_text text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = user_uuid
      AND organization_id::text = org_id_text
  );
$$;

-- Policy: Users can upload images to their organization's folder
CREATE POLICY "Users can upload to venue folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  check_user_org_membership(
    auth.uid(),
    (storage.foldername(name))[1]
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
  check_user_org_membership(
    auth.uid(),
    (storage.foldername(name))[1]
  )
);

-- Policy: Users can update images from their organization's folder
CREATE POLICY "Users can update org images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'images' AND
  check_user_org_membership(
    auth.uid(),
    (storage.foldername(name))[1]
  )
);

