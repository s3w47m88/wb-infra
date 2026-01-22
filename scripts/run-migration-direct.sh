#!/bin/bash

# Load environment variables
source .env

# Use the direct connection (not pooler) for DDL operations
export PGPASSWORD="$SUPABASE_SECRET_KEY"

# Execute the migration
psql "postgresql://postgres:${SUPABASE_SECRET_KEY}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres" \
  -f supabase/migrations/002_create_auth_and_orgs.sql

echo "Migration completed!"
