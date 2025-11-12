# Fixing RLS Policy Error for Organization Creation

## Problem
When creating an organization, you get the error:
```
new row violates row-level security policy for table "organization_members"
```

This happens because Supabase Row-Level Security (RLS) policies prevent direct inserts into the `organization_members` table.

## Solution Options

### Option 1: Use API Route with Service Role Key (Current Implementation) ✅

The current implementation uses an API route (`/api/organizations/create`) that bypasses RLS using the service role key.

**Requirements:**
1. Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
2. Get your service role key from: Supabase Dashboard → Settings → API → service_role key

**Pros:**
- Works immediately
- No database changes needed
- Handles rollback on errors

**Cons:**
- Requires service role key in environment
- Less secure (service role bypasses all RLS)

### Option 2: Use Database Function (Recommended) 🔒

This is more secure as it uses a database function with `SECURITY DEFINER`.

**Steps:**
1. Run the SQL in `database/create_organization_function.sql` in your Supabase SQL editor
2. Update `src/components/organization/create-organization-dialog.tsx` to use `/api/organizations/create-with-function` instead

**Pros:**
- More secure (no service role key needed)
- Atomic transaction (all or nothing)
- Better separation of concerns

**Cons:**
- Requires database function creation

### Option 3: Update RLS Policies

If you prefer to use RLS policies instead, run the SQL in `database/rls_policies.sql`.

**Note:** This approach allows users to insert themselves as owners when creating an organization, but you'll need to ensure the policy is correctly configured.

## Current Status

✅ **Option 1 is currently implemented** - Just add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` and it will work.

## Testing

After setting up, test organization creation:
1. Log in to your app
2. Click "Create Organization" in the organization switcher
3. Fill in name and slug
4. Submit

The organization should be created successfully with you as the owner.

