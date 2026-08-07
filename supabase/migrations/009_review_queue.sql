-- Migration 009: Content review queue for human-in-the-loop moderation
--
-- Adds a review lifecycle to case studies so AI-generated content
-- is not published without human approval.
--
-- States: draft (new AI-generated) → in_review → published OR rejected
-- Existing published cases get 'published' status immediately.

-- 1. Add review_status column with default 'published' for backward compatibility
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS review_status TEXT
  NOT NULL DEFAULT 'published'
  CHECK (review_status IN ('draft', 'in_review', 'published', 'rejected'));

-- 2. Add reviewed_at and reviewed_by tracking
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- 3. Add fact_check_score column for AI confidence tracking
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS fact_check_score INT
  CHECK (fact_check_score >= 0 AND fact_check_score <= 100);

-- 4. Add verified_sources JSONB column for web-validated references
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS verified_sources JSONB DEFAULT '[]'::jsonb;

-- 5. Indexes for queue processing
CREATE INDEX IF NOT EXISTS idx_case_studies_review_status ON case_studies(review_status);
CREATE INDEX IF NOT EXISTS idx_case_studies_published_review ON case_studies(published, review_status);
