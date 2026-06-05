import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SearchInner from '@/components/SearchInner';

export const metadata = {
  title: 'Buscar',
  description: 'Buscá productos en Nova Shop CR',
};

export default function CRSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
          <Loader2 size={24} className="animate-spin" />
          <span>Cargando...</span>
        </div>
      }
    >
      <SearchInner basePath="/cr" filterQuery="vendor:Dropi" />
    </Suspense>
  );
}
