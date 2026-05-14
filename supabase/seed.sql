-- Seed data for Case Studies
INSERT INTO public.case_studies (
  slug, case_number, company_name, founded_year, shutdown_year, 
  industry, funding_raised, summary, failure_reasons, lessons,
  risk_scores, published, published_at, content
) VALUES 
(
  'quibi', 'CASE #0001', 'Quibi', 2018, 2020, 
  'Streaming', 1750000000, 'Short-form mobile streaming service that burned $1.75B in 6 months.', 
  ARRAY['Product-Market Fit', 'Execution', 'Timing'],
  ARRAY['Don''t assume commute-only habits translate to other contexts', 'Vertical-only video is a niche, not a standard', 'Content-first strategies require massive ecosystem lock'],
  '{"pmf": 90, "burn": 85, "competition": 70, "execution": 60, "timing": 80, "team": 30}',
  true, now(), '# The Quibi Autopsy\n\nQuibi launched with massive fanfare and $1.75B in capital, betting that mobile users wanted high-quality "quick bites" of content. \n\n## Failure Vectors\n1. **Mobile-Only Lock**: Forced users into a vertical-only mobile experience at launch.\n2. **The Pandemic**: People stopped commuting, which was Quibi''s primary use case.\n3. **Content mismatch**: Traditional Hollywood production speeds vs. digital consumption habits.'
),
(
  'juicero', 'CASE #0002', 'Juicero', 2013, 2017, 
  'Hardware', 120000000, 'The $400 WiFi-connected juicer that could be squeezed by hand.', 
  ARRAY['Product-Market Fit', 'Over-Engineering'],
  ARRAY['Hardware is hard, but unnecessary hardware is impossible', 'Subscription models don''t fix bad unit economics', 'Solving a problem that doesn''t exist is the ultimate waste'],
  '{"pmf": 95, "burn": 70, "competition": 40, "execution": 80, "timing": 50, "team": 40}',
  true, now(), '# Over-Engineering the Squeeze\n\nJuicero became the poster child for Silicon Valley excess. A $400 machine that applied 4 tons of pressure to packets that could be opened with scissors.'
),
(
  'theranos', 'CASE #0003', 'Theranos', 2003, 2018, 
  'HealthTech', 945000000, 'The massive multi-billion dollar fraud that promised blood testing revolution.', 
  ARRAY['Fraud', 'Founder Ego', 'Regulatory'],
  ARRAY['Science cannot be disrupted by PR alone', 'Board of Directors must have domain expertise', 'Culture of secrecy is a massive red flag'],
  '{"pmf": 20, "burn": 80, "competition": 30, "execution": 95, "timing": 40, "team": 90}',
  true, now(), '# Blood, Sweat, and Lies\n\nElizabeth Holmes promised a revolution in blood testing with a single drop. The reality was a collection of third-party machines and faked results.'
),
(
  'fast', 'CASE #0009', 'Fast', 2019, 2022, 
  'Fintech', 124000000, 'One-click checkout startup that burned $10M/month with minimal revenue.', 
  ARRAY['Burn Rate', 'Revenue Model', 'Blitzscaling'],
  ARRAY['Growth without revenue is a liability', 'Culture and branding cannot mask fundamental lack of product-market fit', 'Efficiency is a feature, not a pivot'],
  '{"pmf": 70, "burn": 100, "competition": 80, "execution": 50, "timing": 40, "team": 60}',
  true, now(), '# The Faster they Fall\n\nFast was a high-growth fintech that prioritised branding and hiring over revenue. By the time they tried to pivot to efficiency, the market had turned.'
),
(
  'pebble', 'CASE #0011', 'Pebble', 2012, 2016, 
  'Hardware', 43000000, 'The smartwatch pioneer that was crushed by giants.', 
  ARRAY['Competition', 'Capital Intensive'],
  '{"pmf": 30, "burn": 60, "competition": 95, "execution": 50, "timing": 20, "team": 40}',
  true, now(), '# Pioneer''s Dilemma\n\nPebble proved the market for smartwatches via Kickstarter, only to be crushed by Apple and Samsung entering the fray with superior ecosystems.'
)
ON CONFLICT (slug) DO UPDATE SET
  funding_raised = EXCLUDED.funding_raised,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary;
