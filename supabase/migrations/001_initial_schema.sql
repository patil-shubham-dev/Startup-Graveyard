-- Core case study table
CREATE TABLE case_studies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT UNIQUE NOT NULL,
  case_number    TEXT UNIQUE NOT NULL,        -- e.g. "CASE #0042"
  company_name   TEXT NOT NULL,
  logo_url       TEXT,
  website        TEXT,
  founded_year   INT,
  shutdown_year  INT,
  country        TEXT,
  industry       TEXT,
  business_model TEXT,
  founders       TEXT[],
  funding_raised BIGINT,                      -- USD cents
  employees_peak INT,
  valuation_peak BIGINT,
  investors      TEXT[],
  summary        TEXT NOT NULL,
  failure_reasons TEXT[],
  root_causes    TEXT[],
  warning_signs  TEXT[],
  lessons        TEXT[],
  tags           TEXT[],
  external_references JSONB,
  risk_scores    JSONB,                       -- { pmf: 0-100, burn: 0-100, ... }
  content        TEXT,                        -- Full MDX content
  published      BOOLEAN DEFAULT false,
  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  embedding      vector(768)                  -- Gemini text-embedding-004
);

-- Pre-Mortem sessions
CREATE TABLE premortem_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  pitch       TEXT NOT NULL,
  questions   JSONB,
  answers     JSONB,
  report      JSONB,
  risk_score  INT,
  share_token TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Chat sessions
CREATE TABLE chat_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users NOT NULL,
  messages   JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS rules
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE premortem_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Public can read published case studies
CREATE POLICY "Public can read published case studies" 
ON case_studies FOR SELECT 
USING (published = true);

-- Authenticated users can manage their own premortem sessions
CREATE POLICY "Users can manage their own premortem sessions" 
ON premortem_sessions FOR ALL 
USING (auth.uid() = user_id);

-- Authenticated users can manage their own chat sessions
CREATE POLICY "Users can manage their own chat sessions" 
ON chat_sessions FOR ALL 
USING (auth.uid() = user_id);
