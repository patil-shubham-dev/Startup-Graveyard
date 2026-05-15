-- Add editorial fields to case_studies table
ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS competitors JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS quotes JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS financial_rounds JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS failure_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verdict JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS archived_media JSONB DEFAULT '[]';

-- Update existing timeline_events to ensure it exists (it was in the TS interface but not the initial SQL)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='case_studies' AND column_name='timeline_events') THEN
        ALTER TABLE case_studies ADD COLUMN timeline_events JSONB DEFAULT '[]';
    END IF;
END $$;

-- Update existing evidence_images to ensure it exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='case_studies' AND column_name='evidence_images') THEN
        ALTER TABLE case_studies ADD COLUMN evidence_images TEXT[] DEFAULT '{}';
    END IF;
END $$;
