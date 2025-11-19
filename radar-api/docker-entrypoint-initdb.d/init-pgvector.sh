#!/bin/bash
set -e

# Crea la extensión pgvector en la base de datos de desarrollo
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS vector;
EOSQL