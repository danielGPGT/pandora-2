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

-- Drop the function if it exists
DROP FUNCTION IF EXISTS check_user_org_membership(uuid, text);

-- Create a function that bypasses RLS completely
-- Using plpgsql with SECURITY DEFINER and SET search_path to avoid RLS recursion
CREATE OR REPLACE FUNCTION check_user_org_membership(user_uuid uuid, org_id_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  result boolean;
BEGIN
  -- Direct query with RLS bypass using SECURITY DEFINER
  -- This function runs with the privileges of the function creator (postgres)
  -- which bypasses RLS policies
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = user_uuid
      AND organization_id::text = org_id_text
  ) INTO result;
  
  RETURN COALESCE(result, false);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_org_membership(uuid, text) TO authenticated;

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
