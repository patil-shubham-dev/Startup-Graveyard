-- Seed data for Case Studies
INSERT INTO public.case_studies (
  slug, case_number, company_name, founded_year, shutdown_year, 
  industry, funding_raised, summary, failure_reasons, 
  risk_scores, published, published_at
) VALUES 
(
  'quibi', 'CASE #0001', 'Quibi', 2018, 2020, 
  'Streaming', 175000000000, 'Short-form mobile streaming service that burned $1.75B in 6 months.', 
  ARRAY['Product-Market Fit', 'Execution', 'Timing'],
  '{"pmf": 90, "burn": 85, "competition": 70, "execution": 60, "timing": 80, "team": 30}',
  true, now()
),
(
  'juicero', 'CASE #0002', 'Juicero', 2013, 2017, 
  'Hardware', 12000000000, 'The $400 WiFi-connected juicer that could be squeezed by hand.', 
  ARRAY['Product-Market Fit', 'Over-Engineering'],
  '{"pmf": 95, "burn": 70, "competition": 40, "execution": 80, "timing": 50, "team": 40}',
  true, now()
),
(
  'theranos', 'CASE #0003', 'Theranos', 2003, 2018, 
  'HealthTech', 94500000000, 'The massive multi-billion dollar fraud that promised blood testing revolution.', 
  ARRAY['Fraud', 'Founder Ego', 'Regulatory'],
  '{"pmf": 20, "burn": 80, "competition": 30, "execution": 95, "timing": 40, "team": 90}',
  true, now()
),
(
  'better-place', 'CASE #0004', 'Better Place', 2007, 2013, 
  'CleanTech', 85000000000, 'Electric vehicle battery-swapping infrastructure that was too early for the market.', 
  ARRAY['Timing', 'Capital Intensive', 'Infrastructure'],
  '{"pmf": 60, "burn": 95, "competition": 50, "execution": 70, "timing": 95, "team": 40}',
  true, now()
),
(
  'jawbone', 'CASE #0005', 'Jawbone', 1999, 2017, 
  'Consumer Electronics', 59000000000, 'Wearable pioneer that lost the market to Fitbit and Apple.', 
  ARRAY['Competition', 'Product Quality', 'Pivot Failure'],
  '{"pmf": 40, "burn": 85, "competition": 95, "execution": 70, "timing": 30, "team": 50}',
  true, now()
),
(
  'katerra', 'CASE #0006', 'Katerra', 2015, 2021, 
  'PropTech', 200000000000, 'SoftBank-backed construction tech startup that grew too fast and collapsed.', 
  ARRAY['Blitzscaling', 'Operational Complexity', 'Supply Chain'],
  '{"pmf": 50, "burn": 98, "competition": 40, "execution": 90, "timing": 40, "team": 60}',
  true, now()
),
(
  'segway', 'CASE #0007', 'Segway', 1999, 2020, 
  'Transportation', 9000000000, 'The "future of transport" that became a niche tourist vehicle.', 
  ARRAY['Hype vs Reality', 'Regulatory', 'Price Point'],
  '{"pmf": 85, "burn": 40, "competition": 30, "execution": 50, "timing": 60, "team": 20}',
  true, now()
),
(
  'essential-products', 'CASE #0008', 'Essential Products', 2015, 2020, 
  'Consumer Electronics', 33000000000, 'Android creator Andy Rubin''s failed attempt to reinvent the smartphone.', 
  ARRAY['Competition', 'Founder Scandal', 'Product-Market Fit'],
  '{"pmf": 80, "burn": 90, "competition": 95, "execution": 60, "timing": 70, "team": 85}',
  true, now()
),
(
  'fast', 'CASE #0009', 'Fast', 2019, 2022, 
  'Fintech', 12400000000, 'One-click checkout startup that burned $10M/month with minimal revenue.', 
  ARRAY['Burn Rate', 'Revenue Model', 'Blitzscaling'],
  '{"pmf": 70, "burn": 100, "competition": 80, "execution": 50, "timing": 40, "team": 60}',
  true, now()
),
(
  'airware', 'CASE #0010', 'Airware', 2011, 2018, 
  'Drones', 11800000000, 'Commercial drone software leader that failed to find a sustainable enterprise market.', 
  ARRAY['Product-Market Fit', 'Competition', 'Hardware-Software Mismatch'],
  '{"pmf": 85, "burn": 90, "competition": 75, "execution": 60, "timing": 80, "team": 40}',
  true, now()
)
ON CONFLICT (slug) DO NOTHING;
