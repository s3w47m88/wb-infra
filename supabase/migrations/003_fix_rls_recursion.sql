-- Fix infinite recursion in organization_members RLS policy
-- The previous policy checked organization_members to determine access to organization_members

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;

-- New policy: Users can view organization_members if they are:
-- 1. The user in that membership record, OR
-- 2. A creator of an organization that has that membership
CREATE POLICY "Users can view members of their organizations"
  ON organization_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_members.organization_id
      AND organizations.created_by = auth.uid()
    )
  );
