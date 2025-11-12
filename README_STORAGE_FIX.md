# Storage Bucket RLS Policy Fix

## Problem
When uploading images to the `images` bucket, you're getting an error:
```
infinite recursion detected in policy for relation "organization_members"
```

This happens because the RLS policy on `storage.objects` is trying to check `organization_members`, but the policy itself might be causing a recursive check.

## Solution
We've created a `SECURITY DEFINER` function that bypasses RLS when checking organization membership. This prevents the recursion issue.

## How to Fix

### Option 1: Using Supabase SQL Editor (Recommended)
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database/storage_images_bucket_setup_fixed.sql`
4. Run the query

### Option 2: Using Supabase CLI
```bash
supabase db execute -f database/storage_images_bucket_setup_fixed.sql
```

## What the Fix Does

1. **Creates the `images` bucket** (if it doesn't exist)
2. **Drops existing conflicting policies** to start fresh
3. **Creates a helper function** `check_user_org_membership`:
   - Uses `SECURITY DEFINER` to bypass RLS
   - Checks if a user is a member of an organization
   - Prevents recursion by using a stable function
4. **Creates new policies** for:
   - **INSERT**: Users can upload to their organization's folder
   - **SELECT**: Anyone can view images (public bucket)
   - **DELETE**: Users can delete images from their organization's folder
   - **UPDATE**: Users can update images from their organization's folder

## Folder Structure
Images are stored with the following path structure:
```
{organization_id}/venue/{timestamp}-{index}.{ext}
```

For example:
```
abc123-def456-ghi789/venue/1234567890-0.jpg
```

## Security
- Only users who are members of an organization can upload to that organization's folder
- Images are publicly viewable (bucket is public)
- Users can only manage images in their own organization's folders
- The function uses `SECURITY DEFINER` to safely bypass RLS without exposing data

## Verification
After running the fix, try uploading an image to a venue. It should work without the recursion error.

