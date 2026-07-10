import type { MarketCategoryId } from './marketCategories';

/** Orden de aparición en el scroll (después de las 3 frases). */
export const MARKET_SCROLL_ORDER: MarketCategoryId[] = [
  'forex',
  'commodities',
  'stocks',
  'indexes',
  'crypto',
];

export const MARKET_SCROLL_IMAGES: Record<MarketCategoryId, string> = {
  forex: '/news/forex.jpg',
  commodities: '/news/commodities-alt.jpg',
  stocks: '/news/stocks.jpg',
  indexes: '/news/featured-stocks.jpg',
  crypto: '/news/crypto.jpg',
};
