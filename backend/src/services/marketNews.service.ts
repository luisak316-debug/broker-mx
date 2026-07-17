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

/** Referencia de credibilidad (Quiénes Somos) — no rota en «Destacado del día». */
export const SALINAS_CREDIBILITY: MarketNewsItem = {
  id: 'credibility-salinas',
  category: 'featured',
  themeCategory: 'crypto',
  categoryLabel: 'Referencia · México',
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

const FEATURED_POOL_SIZE = 24;

let cache: { dateKey: string; items: MarketNewsItem[] } | null = null;
const NEWS_CACHE_VERSION = 'hero-v2';

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
    id: `${article.category}-${dateKey}-${article.url.slice(-12)}`,
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

function investingFallbackFeatured(dateKey: string): MarketNewsItem[] {
  const samples: Array<{ cat: InvestingCategory; title: string; summary: string; trend: 'up' | 'down' }> = [
    {
      cat: 'stocks',
      title: 'Wall Street abre mixto mientras los inversores evalúan datos macro y resultados corporativos',
      summary: 'Los principales índices muestran movimientos selectivos entre sectores tecnológicos y defensivos.',
      trend: 'down',
    },
    {
      cat: 'crypto',
      title: 'Bitcoin consolida niveles clave mientras el flujo institucional define la siguiente tendencia',
      summary: 'El mercado cripto observa volatilidad moderada con foco en ETFs y liquidez global.',
      trend: 'up',
    },
    {
      cat: 'commodities',
      title: 'El oro mantiene demanda defensiva ante escenarios de incertidumbre geopolítica',
      summary: 'Los metales preciosos siguen atrayendo cobertura patrimonial en ciclos volátiles.',
      trend: 'up',
    },
    {
      cat: 'forex',
      title: 'El dólar se fortalece frente a divisas emergentes en jornada de ajuste cambiario',
      summary: 'Los pares FX reflejan expectativas sobre tasas y datos de inflación regionales.',
      trend: 'down',
    },
    {
      cat: 'stocks',
      title: 'Sector tecnológico presiona al alza tras señales de recuperación en la cadena de suministro',
      summary: 'Semiconductores y software lideran ganancias parciales en la sesión.',
      trend: 'up',
    },
  ];

  return samples.map((s, i) =>
    toFeaturedItem(
      {
        title: s.title,
        summary: s.summary,
        url: 'https://es.investing.com/news/',
        imageUrl: LOCAL_FALLBACK[s.cat],
        publishedAt: new Date().toISOString(),
        category: s.cat,
        trend: s.trend,
      },
      dateKey,
      i,
    ),
  );
}

function curatedFallback(dateKey: string): MarketNewsItem[] {
  const featured = investingFallbackFeatured(dateKey);
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
  return [...featured, ...grid];
}

async function buildDailyNews(): Promise<MarketNewsItem[]> {
  const dateKey = todayKey();

  try {
    const [gridArticles, headlinePool] = await Promise.all([
      fetchInvestingDailyNews(),
      fetchInvestingHeadlinePool(FEATURED_POOL_SIZE),
    ]);

    const grid = gridArticles.map((a) => toGridItem(a, dateKey));
    const featured =
      headlinePool.length > 0
        ? headlinePool.map((a, i) => toFeaturedItem(a, dateKey, i))
        : investingFallbackFeatured(dateKey);

    if (grid.length >= 4) {
      return [...featured, ...grid];
    }

    const mergedGrid = grid.length ? grid : curatedFallback(dateKey).slice(featured.length);
    return [...featured, ...mergedGrid];
  } catch (err) {
    console.warn('[market-news] Investing.com no disponible, usando respaldo:', err);
    return curatedFallback(dateKey);
  }
}

export async function getDailyMarketNews(): Promise<MarketNewsItem[]> {
  const dateKey = `${todayKey()}-${NEWS_CACHE_VERSION}`;
  if (cache?.dateKey === dateKey) return cache.items;
  const items = await buildDailyNews();
  cache = { dateKey, items };
  return items;
}

export function warmMarketNewsCache(): void {
  void getDailyMarketNews().catch(() => undefined);
}
