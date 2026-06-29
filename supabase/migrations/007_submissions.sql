-- Submissions queue for startup suggestions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  shutdown_year INT,
  analysis TEXT,
  sources TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  submitted_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  notes TEXT
);

-- Index for queue processing
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- RLS: users can view their own submissions; service role manages queue
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can view their own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = submitted_by);
