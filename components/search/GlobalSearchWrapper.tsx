'use client';

import dynamic from 'next/dynamic';

const GlobalSearchModal = dynamic(() => import('@/components/search/GlobalSearch'), {
  ssr: false,
});

export default function GlobalSearchWrapper() {
  return <GlobalSearchModal />;
}
