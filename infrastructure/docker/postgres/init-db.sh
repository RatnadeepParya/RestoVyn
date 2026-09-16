#!/bin/sh
set -e

# =====================================================================
# RestoVyn PostgreSQL Initialization Script
# Executed automatically during initial database container provisioning
# =====================================================================

echo "==> Initializing RestoVyn database extensions and roles..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable enterprise UUID and fast text search extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "btree_gist";

    -- Create dedicated read-only role for reporting & analytics tools
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'restovyn_readonly') THEN
            CREATE ROLE restovyn_readonly WITH LOGIN PASSWORD '${POSTGRES_READONLY_PASSWORD:-readonly_pass_123}';
        END IF;
    END
    \$\$;

    -- Grant read-only permissions on public schema
    GRANT CONNECT ON DATABASE "$POSTGRES_DB" TO restovyn_readonly;
    GRANT USAGE ON SCHEMA public TO restovyn_readonly;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO restovyn_readonly;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO restovyn_readonly;

    -- Security hardening: Revoke public schema creation from public
    REVOKE CREATE ON SCHEMA public FROM PUBLIC;
    GRANT ALL ON SCHEMA public TO "$POSTGRES_USER";
EOSQL

echo "==> RestoVyn database initialization complete."
