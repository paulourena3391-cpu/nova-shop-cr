// Search page — the inner component uses useSearchParams() so it must be
// wrapped in <Suspense> per Next.js 14 App Router requirements.
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SearchInner from '@/components/SearchInner';

export const metadata = {
  title: 'Search',
  description: 'Search products at Nova Shop CR',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
          <Loader2 size={24} className="animate-spin" />
          <span>Cargando...</span>
        </div>
      }
    >
      <SearchInner />
    </Suspense>
  );
}
