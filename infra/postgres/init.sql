-- Initialize pgvector extension on database creation
CREATE EXTENSION IF NOT EXISTS vector;

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
