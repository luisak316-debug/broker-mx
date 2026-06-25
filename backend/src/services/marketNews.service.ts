import Parser from 'rss-parser';

export type MarketNewsCategory = 'featured' | 'crypto' | 'stocks' | 'commodities' | 'forex';

export interface MarketNewsItem {
  id: string;
  category: MarketNewsCategory;
  categoryLabel: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface CategoryFeed {
  category: Exclude<MarketNewsCategory, 'featured'>;
  label: string;
  feeds: string[];
}

const parser = new Parser({ timeout: 12000 });

const POSITIVE =
  /alcista|avanza|sube|crece|recupera|récord|record|high|surge|rally|gain|gains|bull|optim|strong|rise|rises|jump|boom|aprob|adopt|inflow|milestone|positiv|outperform|upgrade|beat|profit|demanda|fortalece|impulso/i;

const NEGATIVE =
  /crash|caída|caida|plunge|colaps|bear|pánico|panico|crisis|war|guerra|hack|fraude|scam|loss|losses|fall|falls|drop|drops|decline|recesi|default|bankrupt|liquid/i;

const CATEGORIES: CategoryFeed[] = [
  {
    category: 'crypto',
    label: 'Criptomonedas',
    feeds: [
      'https://www.coindesk.com/arc/outboundfeeds/rss/',
      'https://cointelegraph.com/rss',
    ],
  },
  {
    category: 'stocks',
    label: 'Bolsa de Valores',
    feeds: [
      'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^MXX,^GSPC,AAPL&region=US&lang=en-US',
      'https://feeds.marketwatch.com/marketwatch/topstories/',
    ],
  },
  {
    category: 'commodities',
    label: 'Materias Primas',
    feeds: [
      'https://www.kitco.com/rss/KitcoNewsRSS.xml',
      'https://feeds.marketwatch.com/marketwatch/marketpulse/',
    ],
  },
  {
    category: 'forex',
    label: 'Divisas (Forex)',
    feeds: [
      'https://www.dailyfx.com/feeds/market-news',
      'https://feeds.marketwatch.com/marketwatch/topstories/',
    ],
  },
];

/** Titulares curados (positivos) — rotación diaria si RSS no responde. */
const CURATED: Record<Exclude<MarketNewsCategory, 'featured'>, Omit<MarketNewsItem, 'id' | 'category' | 'categoryLabel'>[]> = {
  crypto: [
    {
      title: 'Ricardo Salinas Pliego reafirma su confianza en Bitcoin como activo de largo plazo',
      summary: 'El empresario mexicano destaca la diversificación digital dentro de una estrategia patrimonial moderna.',
      source: 'Medios financieros',
      url: 'https://www.facebook.com/share/1FvLsLtL9K/',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Bitcoin mantiene interés institucional con nuevos flujos hacia ETFs spot',
      summary: 'Los fondos cotizados continúan atrayendo capital de inversionistas de largo plazo.',
      source: 'CoinDesk',
      url: 'https://www.coindesk.com/',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Ethereum consolida ecosistema DeFi con adopción creciente en finanzas digitales',
      summary: 'La red líder en contratos inteligentes sigue expandiendo casos de uso institucionales.',
      source: 'Cointelegraph',
      url: 'https://cointelegraph.com/',
      publishedAt: new Date().toISOString(),
    },
  ],
  stocks: [
    {
      title: 'Wall Street cierra en terreno positivo impulsada por resultados corporativos sólidos',
      summary: 'Grandes emisoras reportan ingresos por encima de expectativas, reforzando la confianza del mercado.',
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Mercado mexicano muestra fortaleza con sectores exportadores en alza',
      summary: 'La Bolsa Mexicana de Valores refleja optimismo en emisoras ligadas a nearshoring.',
      source: 'MarketWatch',
      url: 'https://www.marketwatch.com/',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Tecnología lidera ganancias trimestrales en mercados globales',
      summary: 'Las acciones de innovación mantienen momentum con perspectivas de crecimiento.',
      source: 'MarketWatch',
      url: 'https://www.facebook.com/share/1CwH13b7Bi/',
      publishedAt: new Date().toISOString(),
    },
  ],
  commodities: [
    {
      title: 'El oro refuerza su papel como resguardo patrimonial ante escenarios globales',
      summary: 'La demanda de metales preciosos sigue apoyada por inversionistas institucionales.',
      source: 'Kitco',
      url: 'https://www.kitco.com/',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Plata y cobre muestran demanda industrial estable en mercados emergentes',
      summary: 'Los metales industriales se benefician de la transición energética global.',
      source: 'Kitco',
      url: 'https://www.kitco.com/news/',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Commodities agrícolas mantienen perspectiva favorable por demanda alimentaria',
      summary: 'Los mercados de materias primas agrícolas reflejan dinamismo en exportaciones.',
      source: 'MarketWatch',
      url: 'https://www.marketwatch.com/',
      publishedAt: new Date().toISOString(),
    },
  ],
  forex: [
    {
      title: 'Mercado de divisas presenta oportunidades en pares principales con volatilidad ordenada',
      summary: 'Operadores encuentran liquidez favorable en cruces con el peso mexicano.',
      source: 'DailyFX',
      url: 'https://www.dailyfx.com/',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Dólar-peso mantiene niveles operativos atractivos para diversificación',
      summary: 'El mercado Forex ofrece ventanas para estrategias de cobertura patrimonial.',
      source: 'DailyFX',
      url: 'https://www.facebook.com/share/p/1EEUrFd29p/',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Bancos centrales mantienen enfoque en estabilidad cambiaria regional',
      summary: 'La política monetaria global favorece mercados de divisas transparentes.',
      source: 'MarketWatch',
      url: 'https://www.marketwatch.com/',
      publishedAt: new Date().toISOString(),
    },
  ],
};

let cache: { dateKey: string; items: MarketNewsItem[] } | null = null;
let refreshPromise: Promise<MarketNewsItem[]> | null = null;

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
}

function dayIndex(): number {
  const d = new Date();
  return Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000,
  );
}

function isPositive(title: string, summary?: string): boolean {
  const text = `${title} ${summary ?? ''}`;
  if (NEGATIVE.test(text)) return false;
  return POSITIVE.test(text) || !NEGATIVE.test(text);
}

function pickCurated(category: Exclude<MarketNewsCategory, 'featured'>): MarketNewsItem {
  const pool = CURATED[category];
  const picked = pool[dayIndex() % pool.length]!;
  return {
    id: `${category}-${todayKey()}`,
    category,
    categoryLabel: CATEGORIES.find((c) => c.category === category)!.label,
    ...picked,
    publishedAt: new Date().toISOString(),
  };
}

async function fetchFromFeed(url: string): Promise<{ title: string; link?: string; contentSnippet?: string; isoDate?: string; creator?: string }[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items ?? []).slice(0, 12).map((item) => ({
      title: item.title ?? '',
      link: item.link,
      contentSnippet: item.contentSnippet ?? item.content,
      isoDate: item.isoDate,
      creator: item.creator ?? feed.title,
    }));
  } catch {
    return [];
  }
}

async function fetchCategoryNews(cat: CategoryFeed): Promise<MarketNewsItem | null> {
  for (const feedUrl of cat.feeds) {
    const items = await fetchFromFeed(feedUrl);
    const positive = items.filter((i) => i.title && isPositive(i.title, i.contentSnippet));
    const best = positive[0] ?? items.find((i) => i.title && isPositive(i.title, i.contentSnippet));
    if (best?.title) {
      return {
        id: `${cat.category}-${todayKey()}`,
        category: cat.category,
        categoryLabel: cat.label,
        title: best.title.trim(),
        summary:
          (best.contentSnippet ?? '').slice(0, 160).trim() ||
          `Actualización positiva del mercado de ${cat.label.toLowerCase()}.`,
        source: best.creator ?? new URL(feedUrl).hostname.replace(/^www\./, ''),
        url: best.link ?? '#',
        publishedAt: best.isoDate ?? new Date().toISOString(),
      };
    }
  }
  return null;
}

function buildFeatured(items: MarketNewsItem[]): MarketNewsItem {
  const pool = items.filter((i) => i.category !== 'featured');
  const best =
    pool.find((i) => /bitcoin|oro|record|récord|wall street|etf|salinas/i.test(i.title)) ??
    pool[0] ??
    pickCurated('crypto');

  return {
    ...best,
    id: `featured-${todayKey()}`,
    category: 'featured',
    categoryLabel: 'Destacado del día',
    summary:
      best.summary ||
      'Titular positivo del mercado financiero global para inspirar tu próxima decisión de inversión.',
  };
}

async function refreshNews(): Promise<MarketNewsItem[]> {
  const results = await Promise.all(CATEGORIES.map((cat) => fetchCategoryNews(cat)));
  const byCategory = results.map((item, idx) => item ?? pickCurated(CATEGORIES[idx]!.category));
  const featured = buildFeatured(byCategory);
  return [featured, ...byCategory];
}

export async function getDailyMarketNews(): Promise<MarketNewsItem[]> {
  const dateKey = todayKey();
  if (cache?.dateKey === dateKey) return cache.items;

  if (!refreshPromise) {
    refreshPromise = refreshNews()
      .then((items) => {
        cache = { dateKey, items };
        return items;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/** Precarga al arrancar el servidor (Render). */
export function warmMarketNewsCache(): void {
  void getDailyMarketNews().catch(() => undefined);
}
