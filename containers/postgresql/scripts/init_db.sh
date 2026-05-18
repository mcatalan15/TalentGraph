#!/bin/bash

# # Wait for PostgreSQL to be ready
# until pg_isready -h postgresql -p 5432; do
#   echo "Waiting for PostgreSQL to be ready..."
#   sleep 2
# done

echo "PostgreSQL is ready! Creating tables..."

# Executing SQL tables and fields creation
psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<-EOSQL
    -- Principal Users table
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(42) UNIQUE NOT NULL,
        name VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        intra_login VARCHAR(255) UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table for SIWE security (Control Nonces)
    CREATE TABLE IF NOT EXISTS siwe_nonces (
        nonce VARCHAR(12) PRIMARY KEY,
        wallet_address VARCHAR(42) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Index for cleaning expired nonces quickly and efitiently
    CREATE INDEX IF NOT EXISTS idx_siwe_nonces_expory ON siwe_nonces(expires_at);
EOSQL

echo "Database schema initialized successfully!"