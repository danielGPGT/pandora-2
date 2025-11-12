-- Alternative approach: Database function to create organization
-- This is more secure than using service role key in API routes
-- Run this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION create_organization_with_owner(
  org_name TEXT,
  org_slug TEXT,
  user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create the organization
  INSERT INTO public.tenants (
    name,
    slug,
    default_currency,
    subscription_plan,
    subscription_status
  )
  VALUES (
    org_name,
    org_slug,
    'GBP',
    'free',
    'active'
  )
  RETURNING id INTO org_id;

  -- Add user as owner
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role
  )
  VALUES (
    org_id,
    user_id,
    'owner'
  );

  RETURN org_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_organization_with_owner(TEXT, TEXT, UUID) TO authenticated;

-- Example usage:
-- SELECT create_organization_with_owner('My Org', 'my-org', auth.uid());

