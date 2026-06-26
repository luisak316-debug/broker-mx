export type MarketNewsCategory = 'featured' | 'crypto' | 'stocks' | 'commodities' | 'forex';

export interface MarketNewsItem {
  id: string;
  category: MarketNewsCategory;
  categoryLabel: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
}

/** Imágenes locales en frontend/public/news — siempre cargan en Vercel. */
const NEWS_IMAGES = {
  featured: '/news/featured.jpg',
  crypto: '/news/crypto.jpg',
  stocks: '/news/stocks.jpg',
  commodities: '/news/commodities.jpg',
  forex: '/news/forex.jpg',
} as const;

const CURATED: Record<
  Exclude<MarketNewsCategory, 'featured'>,
  Omit<MarketNewsItem, 'id' | 'category' | 'categoryLabel'>[]
> = {
  crypto: [
    {
      title: 'Ricardo Salinas Pliego reafirma su confianza en Bitcoin como activo de largo plazo',
      summary:
        'El empresario mexicano destaca la diversificación digital dentro de una estrategia patrimonial moderna.',
      source: 'Medios financieros · MX',
      url: 'https://www.facebook.com/share/1FvLsLtL9K/',
      imageUrl: NEWS_IMAGES.featured,
      publishedAt: '',
    },
    {
      title: 'Bitcoin mantiene interés institucional con nuevos flujos hacia ETFs spot',
      summary:
        'Los fondos cotizados continúan atrayendo capital de inversionistas de largo plazo en mercados globales.',
      source: 'CoinDesk',
      url: 'https://www.coindesk.com/',
      imageUrl: NEWS_IMAGES.crypto,
      publishedAt: '',
    },
    {
      title: 'Ethereum consolida ecosistema DeFi con adopción creciente en finanzas digitales',
      summary:
        'La red líder en contratos inteligentes amplía casos de uso para inversionistas institucionales.',
      source: 'Cointelegraph',
      url: 'https://cointelegraph.com/',
      imageUrl: NEWS_IMAGES.crypto,
      publishedAt: '',
    },
  ],
  stocks: [
    {
      title: 'La Bolsa Mexicana muestra fortaleza con sectores exportadores en alza',
      summary:
        'Emisoras ligadas al nearshoring reflejan optimismo y liquidez favorable para inversionistas nacionales.',
      source: 'BMV · MX',
      url: 'https://www.facebook.com/share/1CwH13b7Bi/',
      imageUrl: NEWS_IMAGES.stocks,
      publishedAt: '',
    },
    {
      title: 'Wall Street cierra en terreno positivo impulsada por resultados corporativos sólidos',
      summary:
        'Grandes emisoras reportan ingresos por encima de expectativas, reforzando la confianza del mercado.',
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/',
      imageUrl: NEWS_IMAGES.stocks,
      publishedAt: '',
    },
    {
      title: 'Tecnología lidera ganancias trimestrales en mercados globales',
      summary:
        'Las acciones de innovación mantienen momentum con perspectivas de crecimiento para el segundo semestre.',
      source: 'MarketWatch',
      url: 'https://www.marketwatch.com/',
      imageUrl: NEWS_IMAGES.stocks,
      publishedAt: '',
    },
  ],
  commodities: [
    {
      title: 'El oro refuerza su papel como resguardo patrimonial ante escenarios globales',
      summary:
        'La demanda de metales preciosos sigue apoyada por inversionistas institucionales en México y el mundo.',
      source: 'Kitco',
      url: 'https://www.kitco.com/',
      imageUrl: NEWS_IMAGES.commodities,
      publishedAt: '',
    },
    {
      title: 'Plata y cobre muestran demanda industrial estable en mercados emergentes',
      summary:
        'Los metales industriales se benefician de la transición energética y la expansión manufacturera regional.',
      source: 'Kitco',
      url: 'https://www.kitco.com/news/',
      imageUrl: NEWS_IMAGES.commodities,
      publishedAt: '',
    },
    {
      title: 'Commodities agrícolas mantienen perspectiva favorable por demanda alimentaria',
      summary:
        'Los mercados de materias primas agrícolas reflejan dinamismo en exportaciones latinoamericanas.',
      source: 'MarketWatch',
      url: 'https://www.marketwatch.com/',
      imageUrl: NEWS_IMAGES.commodities,
      publishedAt: '',
    },
  ],
  forex: [
    {
      title: 'Dólar-peso mantiene niveles operativos atractivos para diversificación',
      summary:
        'El mercado Forex ofrece ventanas favorables para estrategias de cobertura patrimonial en pesos.',
      source: 'DailyFX · MX',
      url: 'https://www.facebook.com/share/p/1EEUrFd29p/',
      imageUrl: NEWS_IMAGES.forex,
      publishedAt: '',
    },
    {
      title: 'Mercado de divisas presenta oportunidades en pares principales con volatilidad ordenada',
      summary:
        'Operadores encuentran liquidez favorable en cruces con el peso mexicano y divisas globales.',
      source: 'DailyFX',
      url: 'https://www.dailyfx.com/',
      imageUrl: NEWS_IMAGES.forex,
      publishedAt: '',
    },
    {
      title: 'Divisas globales muestran estabilidad en cruces clave para inversionistas',
      summary:
        'La liquidez internacional favorece operaciones de cobertura en MXN con spreads competitivos.',
      source: 'DailyFX',
      url: 'https://www.dailyfx.com/market-news',
      imageUrl: NEWS_IMAGES.forex,
      publishedAt: '',
    },
  ],
};

const LABELS: Record<Exclude<MarketNewsCategory, 'featured'>, string> = {
  crypto: 'Criptomonedas',
  stocks: 'Bolsa de Valores',
  commodities: 'Materias Primas',
  forex: 'Divisas (Forex)',
};

let cache: { dateKey: string; items: MarketNewsItem[] } | null = null;

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
}

function buildDailyNews(): MarketNewsItem[] {
  const mk = (
    category: Exclude<MarketNewsCategory, 'featured'>,
    index: number,
  ): MarketNewsItem => {
    const picked = CURATED[category][index]!;
    return {
      id: `${category}-${todayKey()}`,
      category,
      categoryLabel: LABELS[category],
      ...picked,
      publishedAt: new Date().toISOString(),
    };
  };

  const salinas = CURATED.crypto[0]!;
  const featured: MarketNewsItem = {
    id: `featured-${todayKey()}`,
    category: 'featured',
    categoryLabel: 'Destacado del día',
    title: salinas.title,
    summary: salinas.summary,
    source: salinas.source,
    url: salinas.url,
    imageUrl: NEWS_IMAGES.featured,
    publishedAt: new Date().toISOString(),
  };

  return [featured, mk('crypto', 1), mk('stocks', 0), mk('commodities', 0), mk('forex', 0)];
}

export async function getDailyMarketNews(): Promise<MarketNewsItem[]> {
  const dateKey = todayKey();
  if (cache?.dateKey === dateKey) return cache.items;
  const items = buildDailyNews();
  cache = { dateKey, items };
  return items;
}

export function warmMarketNewsCache(): void {
  void getDailyMarketNews().catch(() => undefined);
}
