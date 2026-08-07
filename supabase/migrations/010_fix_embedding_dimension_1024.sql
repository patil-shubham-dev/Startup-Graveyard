-- Migration 010: Fix embedding dimension (1024, not 768)
--
-- The model nv-embedqa-e5-v5 outputs 1024-dimensional vectors,
-- not 768 as migration 008 assumed.
-- This migration:
--   1. Drops the old embedding column
--   2. Re-adds with correct vector(1024) type
--   3. Drops and recreates the IVFFlat index
--   4. Updates the match_case_studies() RPC signature to vector(1024)

-- 1. Drop the old RPC function
DROP FUNCTION IF EXISTS match_case_studies(vector(768), float, int);
DROP FUNCTION IF EXISTS match_case_studies(vector(1024), float, int);

-- 2. Drop index on old column
DROP INDEX IF EXISTS idx_case_studies_embedding_ivfflat;

-- 3. Recreate the embedding column with correct dimension
ALTER TABLE case_studies DROP COLUMN IF EXISTS embedding;
ALTER TABLE case_studies ADD COLUMN embedding vector(1024);

-- 4. Recreate the IVFFlat index for 1024d vectors
CREATE INDEX IF NOT EXISTS idx_case_studies_embedding_ivfflat
  ON case_studies
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 5. Recreate the RPC function with correct vector(1024) signature
CREATE OR REPLACE FUNCTION match_case_studies(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  slug text,
  company_name text,
  summary text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.slug,
    cs.company_name,
    cs.summary,
    1 - (cs.embedding <=> query_embedding) AS similarity
  FROM case_studies cs
  WHERE cs.published = true
    AND cs.embedding IS NOT NULL
    AND 1 - (cs.embedding <=> query_embedding) > match_threshold
  ORDER BY cs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
