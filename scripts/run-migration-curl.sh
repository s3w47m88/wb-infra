#!/bin/bash

# Load environment variables
source .env

# Read the migration file
SQL_CONTENT=$(cat supabase/migrations/002_create_auth_and_orgs.sql)

# Execute using Supabase REST API with service role key
curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SECRET_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
  -H "Content-Type: application/json" \
  --data-binary @- <<EOF
{
  "query": $(echo "$SQL_CONTENT" | jq -Rs .)
}
EOF

echo "\nMigration execution attempted."
