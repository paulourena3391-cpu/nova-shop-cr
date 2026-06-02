'use client';

import { Suspense } from 'react';
import PageProgress from './PageProgress';

// Wraps PageProgress in Suspense because it uses useSearchParams
export default function PageProgressWrapper() {
  return (
    <Suspense fallback={null}>
      <PageProgress />
    </Suspense>
  );
}
