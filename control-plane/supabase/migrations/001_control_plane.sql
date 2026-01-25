-- Control Plane schema (auth/orgs/memberships/invitations)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  marketing_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,
  company_email TEXT,
  company_phone TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS company_email TEXT,
  ADD COLUMN IF NOT EXISTS company_phone TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_token TEXT UNIQUE NOT NULL,
  email TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organization_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_org ON organization_invitations(organization_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
CREATE POLICY "Users can view organizations they belong to"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Organization creators can update their organizations" ON organizations;
CREATE POLICY "Organization creators can update their organizations"
  ON organizations FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Organization creators can delete their organizations" ON organizations;
CREATE POLICY "Organization creators can delete their organizations"
  ON organizations FOR DELETE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
CREATE POLICY "Users can view members of their organizations"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Organization creators can add members" ON organization_members;
CREATE POLICY "Organization creators can add members"
  ON organization_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_members.organization_id
      AND organizations.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can leave organizations" ON organization_members;
CREATE POLICY "Users can leave organizations"
  ON organization_members FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view invitations for their organizations" ON organization_invitations;
CREATE POLICY "Users can view invitations for their organizations"
  ON organization_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_invitations.organization_id
      AND organizations.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organization creators can create invitations" ON organization_invitations;
CREATE POLICY "Organization creators can create invitations"
  ON organization_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_invitations.organization_id
      AND organizations.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can view invitation by token" ON organization_invitations;
CREATE POLICY "Anyone can view invitation by token"
  ON organization_invitations FOR SELECT
  USING (invite_token IS NOT NULL);
