#!/bin/bash
set -e

# Crea la extensión pgvector en la base de datos de pruebas
psql -v ON_ERROR_STOP=1 --username "test-user" --dbname "radar-test-db" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS vector;
EOSQL