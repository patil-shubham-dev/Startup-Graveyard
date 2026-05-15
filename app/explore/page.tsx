import { listCaseStudies } from '@/lib/db/case-studies';
import { ExploreClient } from './ExploreClient';

export const revalidate = 3600;

export default async function ExplorePage() {
  const initialCases = await listCaseStudies();

  return <ExploreClient initialCases={initialCases} />;
}
