-- Migration 008: Fix embedding dimension (768, not 1024) + IVFFlat index
--
-- The model nv-embedqa-e5-v5 outputs 768-dimensional vectors.
-- Migration 003 incorrectly set the column to vector(1024).
-- This migration:
--   1. Drops the old embedding column (loses existing embeddings)
--   2. Re-adds with correct vector(768) type
--   3. Updates the match_case_studies() RPC function signature
--   4. Adds an IVFFlat index for efficient similarity search at scale
--
-- WARNING: Existing embeddings will be lost and must be regenerated.
-- Run the daily-autopsy script or a manual batch to regenerate.
--
-- If you already have vector(768) (i.e., migration 003 was never applied),
-- this migration is still safe — it's a no-op on the column type.

-- 1. Drop the old RPC function if it exists with either signature
DROP FUNCTION IF EXISTS match_case_studies(vector(1024), float, int);
DROP FUNCTION IF EXISTS match_case_studies(vector(768), float, int);

-- 2. Recreate the embedding column with correct dimension
-- This is cleaner than ALTER TYPE which would fail on existing 1024d data
ALTER TABLE case_studies DROP COLUMN IF EXISTS embedding;
ALTER TABLE case_studies ADD COLUMN embedding vector(768);

-- 3. Recreate the RPC function with correct vector(768) signature
CREATE OR REPLACE FUNCTION match_case_studies(
  query_embedding vector(768),
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

-- 4. Add IVFFlat index for similarity search at scale
-- lists=100 is optimal for ~10K rows; increase for larger datasets
-- (lists ≈ sqrt(rows))
CREATE INDEX IF NOT EXISTS idx_case_studies_embedding_ivfflat
  ON case_studies
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 5. Update the get_archive_stats RPC if it references embedding
-- (it doesn't directly, but keep this note for awareness)
