// TikTok Pixel helper — fires events only when the pixel is loaded (CR market).
// The pixel itself is injected by <TikTokPixel/> only on /cr routes, so these
// calls are no-ops on the USA store (window.ttq is undefined there).

export const TIKTOK_PIXEL_ID = 'D8I4HSBC77U8POE06S7G';

type TtqParams = {
  content_id?: string;
  content_type?: 'product' | 'product_group';
  content_name?: string;
  quantity?: number;
  price?: number;
  value?: number;
  currency?: string;
};

type Ttq = { track: (e: string, p?: object) => void };

/**
 * Track a standard TikTok event. The pixel is injected by <TikTokPixel/> in a
 * client effect, which can run a moment AFTER a page's own effects (e.g. the
 * ViewContent fired on product mount). To avoid losing those early events we
 * retry briefly until window.ttq is ready, then fire — instead of no-op'ing.
 */
export function ttqTrack(event: string, params: TtqParams = {}): void {
  if (typeof window === 'undefined') return;
  const payload = { currency: 'USD', ...params };

  const getTtq = () => (window as unknown as { ttq?: Ttq }).ttq;

  const fireNow = getTtq();
  if (fireNow?.track) {
    fireNow.track(event, payload);
    return;
  }

  // Not ready yet — poll for up to ~10s (the pixel loads within a few hundred ms).
  let tries = 0;
  const id = window.setInterval(() => {
    tries += 1;
    const ttq = getTtq();
    if (ttq?.track) {
      ttq.track(event, payload);
      window.clearInterval(id);
    } else if (tries >= 40) {
      window.clearInterval(id);
    }
  }, 250);
}
