-- RLS Policies for organization_members table
-- Run these in your Supabase SQL editor if you prefer RLS over service role

-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own memberships
CREATE POLICY "Users can view their own memberships"
ON public.organization_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can view members of organizations they belong to
CREATE POLICY "Users can view members of their organizations"
ON public.organization_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
  )
);

-- Policy: Users can insert themselves as members when creating an organization
-- This allows the creator to add themselves as owner
CREATE POLICY "Users can insert themselves as organization owner"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'owner'
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = organization_members.organization_id
  )
);

-- Policy: Admins and owners can insert new members
CREATE POLICY "Admins and owners can add members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  )
);

-- Policy: Users can update their own membership (limited fields)
CREATE POLICY "Users can update their own membership"
ON public.organization_members
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Owners and admins can update any member in their organization
CREATE POLICY "Owners and admins can update members"
ON public.organization_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  )
);

-- Policy: Owners can delete members from their organization
CREATE POLICY "Owners can remove members"
ON public.organization_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role = 'owner'
  )
);

