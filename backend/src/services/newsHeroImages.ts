import type { InvestingCategory } from './investingNews.service';

const GENERIC_INVESTING_IMAGES = [
  'world_news_2',
  'investingcom_analysis_og',
  'redesign/images/seo/investingcom',
];

/** Pools locales HD — únicos por titular, sin hotlink bloqueado. */
const HERO_POOLS: Record<InvestingCategory, string[]> = {
  stocks: [
    '/news/featured-stocks.jpg',
    '/news/stocks-bmv.jpg',
    '/news/stocks.jpg',
    '/news/featured-2.jpg',
    '/news/featured.jpg',
  ],
  crypto: ['/news/crypto.jpg', '/news/featured-alt.jpg', '/news/featured.jpg', '/news/featured-2.jpg'],
  commodities: [
    '/news/commodities.jpg',
    '/news/commodities-alt.jpg',
    '/news/commodities-2.jpg',
    '/news/featured.jpg',
  ],
  forex: ['/news/featured-forex.jpg', '/news/forex.jpg', '/news/featured-stocks.jpg', '/news/stocks.jpg'],
};

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) >>> 0;
  return h;
}

function pickFromPool(category: InvestingCategory, seed: string): string {
  const pool = HERO_POOLS[category] ?? HERO_POOLS.stocks;
  return pool[hashSeed(seed) % pool.length]!;
}

/** Refina categoría según palabras clave del titular. */
export function refineCategoryFromText(
  category: InvestingCategory,
  title: string,
  summary: string,
): InvestingCategory {
  const t = `${title} ${summary}`.toLowerCase();
  if (/bitcoin|btc|ethereum|cripto|blockchain|etf.*spot/.test(t)) return 'crypto';
  if (/oro|plata|plata|petr[oó]leo|wti|brent|materias primas|commodit|cobre|ma[ií]z/.test(t))
    return 'commodities';
  if (/forex|divisa|d[oó]lar|peso|usd\/|eur\/|cambiario|moneda/.test(t)) return 'forex';
  return category;
}

export function isBlockedInvestingImage(url: string | undefined): boolean {
  if (!url) return true;
  if (url.startsWith('/news/')) return false;
  // Investing CDN bloquea hotlink; nunca servir esas URLs al cliente.
  if (/investing\.com|i-invdn-com/i.test(url)) return true;
  return GENERIC_INVESTING_IMAGES.some((g) => url.includes(g));
}

/** Imagen hero servida desde nuestro dominio (alta resolución, sin pixelar). */
export function resolveHeroImage(
  category: InvestingCategory,
  title: string,
  summary: string,
  seed: string,
  remoteUrl?: string,
): string {
  if (remoteUrl && !isBlockedInvestingImage(remoteUrl) && !remoteUrl.includes('108x81')) {
    return remoteUrl;
  }
  const refined = refineCategoryFromText(category, title, summary);
  return pickFromPool(refined, seed);
}
