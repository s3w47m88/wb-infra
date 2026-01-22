# Database Setup Required

## ⚠️ IMPORTANT: Database migrations must be run manually

The application cannot create database tables programmatically due to Supabase API limitations and missing database password. All automated approaches have been attempted and documented below.

## Failed Automated Approaches
- ❌ Supabase CLI `db push` - Requires database password (not available in .env)
- ❌ Direct PostgreSQL connection via `psql` - DNS resolution failure
- ❌ Supabase REST API `exec_sql` - Function does not exist
- ❌ Node.js pg client - Connection timeout / authentication failure

## Migration 001: Pages Table (✅ COMPLETED)

This migration has already been run.

## Migration 002: Auth & Organizations (⏳ PENDING)

### Steps to Create the Auth Tables:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/tgysqsudciexskzbvrsr

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Run the Migration**
   - Copy the entire contents of: `supabase/migrations/002_create_auth_and_orgs.sql`
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see success messages for each table created
   - The new tables will appear in your Database tables list

### What This Migration Creates:

**Tables:**
- `user_profiles` - Extends auth.users with first_name, last_name, phone, marketing_opt_in
- `organizations` - Company/campaign organization information
- `organization_members` - Many-to-many relationship between users and organizations
- `organization_invitations` - Link-based invitation system with expiration

**Updates:**
- Adds `organization_id` column to `pages` table for multi-tenant filtering

**Security:**
- Comprehensive RLS policies for multi-tenant architecture
- Automatic trigger to add organization creator as member
- Policies ensure users only see data from their organizations

### After Running This Migration:

You'll be able to implement:
- User registration with organization creation
- Login with organization selection
- Multi-tenant website builder
- Invitation system for team members
- Organization switcher in toolbar

### Alternative: Use Script (Requires Database Password)

If you have the database password:

1. Get your database password from [Database Settings](https://supabase.com/dashboard/project/tgysqsudciexskzbvrsr/settings/database)
2. Add to `.env`: `SUPABASE_DB_PASSWORD=your_password_here`
3. Run: `node scripts/create-auth-tables.js`
