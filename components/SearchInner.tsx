'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { searchProducts, ShopifyProduct } from '@/lib/shopify';
import { useLang } from '@/context/LanguageContext';
import ProductCard from './ProductCard';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

type Props = {
  basePath?: string;
  filterQuery?: string; // Prepended to every search, e.g. "vendor:Dropi" for CR market
};

export default function SearchInner({ basePath = '', filterQuery }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLang();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  // Keep URL in sync with the search input
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  // Fetch results on debounced query change
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setTotalCount(0);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(false);

    const fullQuery = filterQuery ? `${filterQuery} ${debouncedQuery}` : debouncedQuery;
    searchProducts(fullQuery, 20)
      .then(({ products, totalCount }) => {
        setResults(products);
        setTotalCount(totalCount);
        setHasSearched(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  function clearSearch() {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search input */}
      <div className="max-w-2xl mx-auto mb-10">
        <h1 className="font-display text-4xl text-navy text-center mb-6">{t.search}</h1>

        <div className="relative flex items-center">
          <Search size={20} className="absolute left-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoFocus
            className="input-field pl-12 pr-12 py-4 text-base shadow-sm"
            aria-label={t.searchPlaceholder}
          />
          {loading ? (
            <Loader2
              size={18}
              className="absolute right-4 text-brand-orange animate-spin"
              aria-hidden
            />
          ) : query ? (
            <button
              onClick={clearSearch}
              className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Empty state */}
      {!query && !hasSearched && (
        <div className="text-center py-20 text-gray-400">
          <Search size={56} className="mx-auto mb-4 text-gray-200" />
          <p className="text-lg">{t.searchPlaceholder}</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 text-sm">
              {totalCount} resultado{totalCount !== 1 ? 's' : ''} {t.showingResults}{' '}
              <span className="font-semibold text-navy">"{debouncedQuery}"</span>
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-xl mb-2">{t.noResults}</p>
              <p className="text-gray-400 text-sm mb-6">
                Intentá con términos más generales o revisá la ortografía.
              </p>
              <button onClick={clearSearch} className="btn-outline">
                Nueva búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} basePath={basePath} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
