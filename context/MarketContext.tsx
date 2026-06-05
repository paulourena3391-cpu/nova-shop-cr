'use client';

import { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

type Market = 'us' | 'cr';

type MarketContextType = {
  market: Market;
  isCR: boolean;
  basePath: string; // '' for US, '/cr' for CR
};

const MarketContext = createContext<MarketContextType>({
  market: 'us',
  isCR: false,
  basePath: '',
});

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCR = pathname.startsWith('/cr');

  return (
    <MarketContext.Provider
      value={{ market: isCR ? 'cr' : 'us', isCR, basePath: isCR ? '/cr' : '' }}
    >
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket(): MarketContextType {
  return useContext(MarketContext);
}
