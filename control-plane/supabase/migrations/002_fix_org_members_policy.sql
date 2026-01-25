-- Fix organization_members select policy to avoid recursive RLS

DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
CREATE POLICY "Users can view members of their organizations"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());
