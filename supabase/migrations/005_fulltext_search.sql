-- Full-text search support for case studies
-- Uses trigger-based approach (GENERATED ALWAYS AS doesn't work with array_to_string)

-- Add search vector column
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index on the search vector
CREATE INDEX IF NOT EXISTS idx_case_studies_search 
ON case_studies USING GIN (search_vector);

-- Function to update the search vector on insert/update
CREATE OR REPLACE FUNCTION update_case_study_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.company_name, '') || ' ' || 
    coalesce(NEW.summary, '') || ' ' || 
    coalesce(NEW.industry, '') || ' ' || 
    coalesce(array_to_string(coalesce(NEW.failure_reasons, '{}'::text[]), ' '), '') || ' ' || 
    coalesce(array_to_string(coalesce(NEW.tags, '{}'::text[]), ' '), '')
  );
  RETURN NEW;
END;
$$;

-- Trigger runs before insert or update of any content column
CREATE TRIGGER trg_case_study_search_vector
  BEFORE INSERT OR UPDATE OF company_name, summary, industry, failure_reasons, tags
  ON case_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_case_study_search_vector();

-- Backfill existing rows (trigger won't fire for UPDATE of same value, so we do it directly)
UPDATE case_studies 
SET search_vector = to_tsvector('english', 
    coalesce(company_name, '') || ' ' || 
    coalesce(summary, '') || ' ' || 
    coalesce(industry, '') || ' ' || 
    coalesce(array_to_string(coalesce(failure_reasons, '{}'::text[]), ' '), '') || ' ' || 
    coalesce(array_to_string(coalesce(tags, '{}'::text[]), ' '), '')
)
WHERE search_vector IS NULL;

-- Full-text search function
CREATE OR REPLACE FUNCTION search_case_studies_fulltext(
  search_query text,
  result_limit int DEFAULT 10,
  result_offset int DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  slug text,
  company_name text,
  industry text,
  case_number text,
  summary text,
  failure_reasons text[],
  funding_raised bigint,
  shutdown_year int,
  published_at timestamptz,
  rank float4
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.slug,
    cs.company_name,
    cs.industry,
    cs.case_number,
    cs.summary,
    cs.failure_reasons,
    cs.funding_raised,
    cs.shutdown_year,
    cs.published_at,
    ts_rank(cs.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM case_studies cs
  WHERE cs.published = true
    AND cs.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;
