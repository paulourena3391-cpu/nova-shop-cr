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

/** Track a standard TikTok event. Silently no-ops if the pixel isn't present. */
export function ttqTrack(event: string, params: TtqParams = {}): void {
  if (typeof window === 'undefined') return;
  const ttq = (window as unknown as { ttq?: { track: (e: string, p?: object) => void } }).ttq;
  if (ttq?.track) {
    ttq.track(event, { currency: 'USD', ...params });
  }
}
