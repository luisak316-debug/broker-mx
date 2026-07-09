import type { MarketCategoryId } from './marketCategories';

/** Orden de aparición en el scroll (después de las 3 frases). */
export const MARKET_SCROLL_ORDER: MarketCategoryId[] = [
  'crypto',
  'stocks',
  'commodities',
  'forex',
];

export const MARKET_SCROLL_IMAGES: Record<MarketCategoryId, string> = {
  crypto: '/news/crypto.jpg',
  stocks: '/news/stocks.jpg',
  commodities: '/news/commodities-alt.jpg',
  forex: '/news/forex.jpg',
};
