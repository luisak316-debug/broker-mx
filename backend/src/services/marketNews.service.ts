import {
  fetchInvestingDailyNews,
  fetchInvestingHeadlinePool,
  type InvestingArticle,
  type InvestingCategory,
} from './investingNews.service';

export type MarketNewsCategory = 'featured' | 'crypto' | 'stocks' | 'commodities' | 'forex';

export interface MarketNewsItem {
  id: string;
  category: MarketNewsCategory;
  categoryLabel: string;
  themeCategory?: Exclude<MarketNewsCategory, 'featured'>;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  trend?: 'up' | 'down' | 'neutral';
}

const SALINAS_FEATURED: MarketNewsItem = {
  id: 'featured-salinas',
  category: 'featured',
  themeCategory: 'crypto',
  categoryLabel: 'Destacado del día',
  title: 'Ricardo Salinas Pliego reafirma su confianza en Bitcoin como activo de largo plazo',
  summary:
    'El empresario mexicano destaca Bitcoin como reserva de valor sólida frente a la inflación y la incertidumbre global.',
  source: 'Medios financieros · MX',
  url: 'https://www.facebook.com/share/1FvLsLtL9K/',
  imageUrl: '/news/featured.jpg',
  publishedAt: new Date().toISOString(),
};

const LABELS: Record<Exclude<MarketNewsCategory, 'featured'>, string> = {
  crypto: 'Criptomonedas',
  stocks: 'Bolsa de Valores',
  commodities: 'Materias Primas',
  forex: 'Divisas (Forex)',
};

const LOCAL_FALLBACK: Record<InvestingCategory, string> = {
  crypto: '/news/crypto.jpg',
  stocks: '/news/stocks.jpg',
  commodities: '/news/commodities.jpg',
  forex: '/news/forex.jpg',
};

let cache: { dateKey: string; items: MarketNewsItem[] } | null = null;

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
}

function trendBadge(trend: InvestingArticle['trend']): string {
  if (trend === 'up') return 'Mercados al alza';
  if (trend === 'down') return 'Mercados a la baja';
  return 'Mercados en foco';
}

function toGridItem(article: InvestingArticle, dateKey: string): MarketNewsItem {
  return {
    id: `${article.category}-${dateKey}`,
    category: article.category,
    categoryLabel: LABELS[article.category],
    title: article.title,
    summary: article.summary,
    source: 'Investing.com',
    url: article.url,
    imageUrl: article.imageUrl || LOCAL_FALLBACK[article.category],
    publishedAt: article.publishedAt,
    trend: article.trend,
  };
}

function toFeaturedItem(article: InvestingArticle, dateKey: string, index: number): MarketNewsItem {
  return {
    id: `featured-investing-${dateKey}-${index}`,
    category: 'featured',
    themeCategory: article.category,
    categoryLabel: trendBadge(article.trend),
    title: article.title,
    summary: article.summary,
    source: 'Investing.com · Actualizado hoy',
    url: article.url,
    imageUrl: article.imageUrl || LOCAL_FALLBACK[article.category],
    publishedAt: article.publishedAt,
    trend: article.trend,
  };
}

function curatedFallback(dateKey: string): MarketNewsItem[] {
  const grid: MarketNewsItem[] = (['forex', 'commodities', 'stocks', 'crypto'] as InvestingCategory[]).map(
    (cat) => ({
      id: `${cat}-fallback-${dateKey}`,
      category: cat,
      categoryLabel: LABELS[cat],
      title: LABELS[cat],
      summary: 'Titulares del día disponibles en breve.',
      source: 'INVERMAX LATAM',
      url: 'https://es.investing.com/news/',
      imageUrl: LOCAL_FALLBACK[cat],
      publishedAt: new Date().toISOString(),
    }),
  );
  return [SALINAS_FEATURED, ...grid];
}

async function buildDailyNews(): Promise<MarketNewsItem[]> {
  const dateKey = todayKey();

  try {
    const [gridArticles, headlinePool] = await Promise.all([
      fetchInvestingDailyNews(),
      fetchInvestingHeadlinePool(),
    ]);

    const grid = gridArticles.map((a) => toGridItem(a, dateKey));
    const featuredInvesting = headlinePool.slice(0, 4).map((a, i) => toFeaturedItem(a, dateKey, i));

    // Salinas permanece como referencia de calidad; Investing rota en destacados.
    const featured: MarketNewsItem[] = [SALINAS_FEATURED, ...featuredInvesting];

    if (grid.length >= 4) {
      return [...featured, ...grid];
    }

    const mergedGrid = grid.length ? grid : curatedFallback(dateKey).slice(1);
    return [...featured, ...mergedGrid];
  } catch (err) {
    console.warn('[market-news] Investing.com no disponible, usando respaldo:', err);
    return curatedFallback(dateKey);
  }
}

export async function getDailyMarketNews(): Promise<MarketNewsItem[]> {
  const dateKey = todayKey();
  if (cache?.dateKey === dateKey) return cache.items;
  const items = await buildDailyNews();
  cache = { dateKey, items };
  return items;
}

export function warmMarketNewsCache(): void {
  void getDailyMarketNews().catch(() => undefined);
}
