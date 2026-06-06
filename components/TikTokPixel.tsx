'use client';

// TikTok Pixel — loaded ONLY on the Costa Rica market (/cr) for TikTok Ads tracking.
// The USA store (/) is never touched: on non-/cr routes this renders nothing and
// never injects the script. Fires a PageView on every /cr client-side navigation.

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { TIKTOK_PIXEL_ID } from '@/lib/tiktok';

export default function TikTokPixel() {
  const pathname = usePathname();
  const isCR = !!pathname?.startsWith('/cr');
  const injected = useRef(false);

  useEffect(() => {
    if (!isCR) return;
    const w = window as unknown as { ttq?: { page: () => void } };

    if (!injected.current && !w.ttq) {
      injected.current = true;
      const s = document.createElement('script');
      s.id = 'tiktok-pixel';
      s.innerHTML = `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('${TIKTOK_PIXEL_ID}');ttq.page();
}(window, document, 'ttq');`;
      document.head.appendChild(s);
    } else if (w.ttq) {
      // Subsequent client-side navigations within /cr
      w.ttq.page();
    }
  }, [pathname, isCR]);

  return null;
}
