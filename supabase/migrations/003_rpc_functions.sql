-- Fix embedding dimension (was 768 for Gemini, now 1024 for NVIDIA nv-embedqa-e5-v5)
ALTER TABLE case_studies ALTER COLUMN embedding TYPE vector(1024);

-- Match case studies by vector similarity
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

-- Archive stats for dashboard / homepage
CREATE OR REPLACE FUNCTION get_archive_stats()
RETURNS JSON
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result JSON;
  total_cases INT;
  total_burned BIGINT;
  failure_json JSON;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(funding_raised), 0)
  INTO total_cases, total_burned
  FROM case_studies
  WHERE published = true;

  -- Failure category breakdown
  SELECT JSON_AGG(sub)
  INTO failure_json
  FROM (
    SELECT
      unnest(failure_reasons) AS name,
      COUNT(*) AS value
    FROM case_studies
    WHERE published = true
    GROUP BY name
    ORDER BY value DESC
  ) sub;

  result := JSON_BUILD_OBJECT(
    'totalCases', total_cases,
    'totalBurned', total_burned,
    'failureData', COALESCE(failure_json, '[]'::JSON),
    'avgLifespan', COALESCE((SELECT ROUND(AVG(shutdown_year - founded_year)) FROM case_studies WHERE published = true AND founded_year IS NOT NULL AND shutdown_year IS NOT NULL), 0),
    'patternCount', (SELECT COUNT(DISTINCT unnest(failure_reasons)) FROM case_studies WHERE published = true),
    'totalLessons', (SELECT COALESCE(SUM(jsonb_array_length(to_jsonb(lessons))), 0) FROM case_studies WHERE published = true),
    'topLiquidations', COALESCE((
      SELECT JSON_AGG(sub2)
      FROM (
        SELECT company_name, funding_raised, shutdown_year, slug
        FROM case_studies
        WHERE published = true AND funding_raised IS NOT NULL
        ORDER BY funding_raised DESC
        LIMIT 5
      ) sub2
    ), '[]'::JSON)
  );

  RETURN result;
END;
$$;
