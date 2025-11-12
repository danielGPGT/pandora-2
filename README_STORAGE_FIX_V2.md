# Storage Bucket RLS Policy Fix (Version 2)

## Problem
When uploading images to the `images` bucket, you're getting an error:
```
infinite recursion detected in policy for relation "organization_members"
```

This happens because:
1. The storage policy calls a function that queries `organization_members`
2. The `organization_members` table has RLS policies that also query `organization_members`
3. This creates an infinite recursion loop

## Solution
We use a `SECURITY DEFINER` function with `plpgsql` and `SET search_path` that:
- Runs with the privileges of the function creator (postgres role)
- Bypasses RLS policies completely
- Uses `SET search_path` to ensure proper schema resolution

## How to Fix

### Step 1: Run the SQL Script
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database/storage_images_bucket_setup_fixed_v2.sql`
4. Run the query

### Step 2: Verify the Function
After running, verify the function was created:
```sql
SELECT proname, prosecdef, proconfig 
FROM pg_proc 
WHERE proname = 'check_user_org_membership';
```

You should see `prosecdef = true` (meaning SECURITY DEFINER is enabled).

## What the Fix Does

1. **Creates the `images` bucket** (if it doesn't exist)
2. **Drops existing conflicting policies** to start fresh
3. **Creates a helper function** `check_user_org_membership`:
   - Uses `SECURITY DEFINER` to run as postgres (bypasses RLS)
   - Uses `plpgsql` language for better control
   - Sets `search_path` to ensure proper schema resolution
   - Directly queries `organization_members` without triggering RLS
4. **Grants execute permission** to authenticated users
5. **Creates new policies** for:
   - **INSERT**: Users can upload to their organization's folder
   - **SELECT**: Anyone can view images (public bucket)
   - **DELETE**: Users can delete images from their organization's folder
   - **UPDATE**: Users can update images from their organization's folder

## Why This Works

The `SECURITY DEFINER` function runs with the privileges of the function creator (typically the `postgres` superuser). When it queries `organization_members`, it bypasses all RLS policies because:
- The function owner (postgres) has full access to all tables
- RLS policies don't apply to queries made by the function owner
- The `SET search_path` ensures we're querying the right schema

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
- The function safely bypasses RLS without exposing data to unauthorized users

## Troubleshooting

If you still get recursion errors:

1. **Check if the function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'check_user_org_membership';
   ```

2. **Check if policies exist:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%venue%';
   ```

3. **Try dropping and recreating the function:**
   ```sql
   DROP FUNCTION IF EXISTS check_user_org_membership(uuid, text);
   -- Then run the full script again
   ```

4. **Verify RLS is enabled on organization_members:**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'organization_members';
   ```

