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

/** Titulares curados en español (México) — rotación diaria, tono positivo. */
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
      publishedAt: '',
    },
    {
      title: 'Bitcoin mantiene interés institucional con nuevos flujos hacia ETFs spot',
      summary:
        'Los fondos cotizados continúan atrayendo capital de inversionistas de largo plazo en mercados globales.',
      source: 'CoinDesk',
      url: 'https://www.coindesk.com/',
      publishedAt: '',
    },
    {
      title: 'Ethereum consolida ecosistema DeFi con adopción creciente en finanzas digitales',
      summary:
        'La red líder en contratos inteligentes amplía casos de uso para inversionistas institucionales.',
      source: 'Cointelegraph',
      url: 'https://cointelegraph.com/',
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
      publishedAt: '',
    },
    {
      title: 'Wall Street cierra en terreno positivo impulsada por resultados corporativos sólidos',
      summary:
        'Grandes emisoras reportan ingresos por encima de expectativas, reforzando la confianza del mercado.',
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/',
      publishedAt: '',
    },
    {
      title: 'Tecnología lidera ganancias trimestrales en mercados globales',
      summary:
        'Las acciones de innovación mantienen momentum con perspectivas de crecimiento para el segundo semestre.',
      source: 'MarketWatch',
      url: 'https://www.marketwatch.com/',
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
      publishedAt: '',
    },
    {
      title: 'Plata y cobre muestran demanda industrial estable en mercados emergentes',
      summary:
        'Los metales industriales se benefician de la transición energética y la expansión manufacturera regional.',
      source: 'Kitco',
      url: 'https://www.kitco.com/news/',
      publishedAt: '',
    },
    {
      title: 'Commodities agrícolas mantienen perspectiva favorable por demanda alimentaria',
      summary:
        'Los mercados de materias primas agrícolas reflejan dinamismo en exportaciones latinoamericanas.',
      source: 'MarketWatch',
      url: 'https://www.marketwatch.com/',
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
      publishedAt: '',
    },
    {
      title: 'Mercado de divisas presenta oportunidades en pares principales con volatilidad ordenada',
      summary:
        'Operadores encuentran liquidez favorable en cruces con el peso mexicano y divisas globales.',
      source: 'DailyFX',
      url: 'https://www.dailyfx.com/',
      publishedAt: '',
    },
    {
      title: 'Divisas globales muestran estabilidad en cruces clave para inversionistas',
      summary:
        'La liquidez internacional favorece operaciones de cobertura en MXN con spreads competitivos.',
      source: 'DailyFX',
      url: 'https://www.dailyfx.com/market-news',
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

function dayIndex(): number {
  const d = new Date();
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

function pickCurated(
  category: Exclude<MarketNewsCategory, 'featured'>,
  offset = 0,
): MarketNewsItem {
  const pool = CURATED[category];
  const picked = pool[(dayIndex() + offset) % pool.length]!;
  return {
    id: `${category}-${todayKey()}`,
    category,
    categoryLabel: LABELS[category],
    ...picked,
    publishedAt: new Date().toISOString(),
  };
}

function buildDailyNews(): MarketNewsItem[] {
  const salinas = CURATED.crypto[0]!;
  const featured: MarketNewsItem = {
    id: `featured-${todayKey()}`,
    category: 'featured',
    categoryLabel: 'Destacado del día',
    title: salinas.title,
    summary: salinas.summary,
    source: salinas.source,
    url: salinas.url,
    publishedAt: new Date().toISOString(),
  };

  return [
    featured,
    pickCurated('crypto', 1),
    pickCurated('stocks', 0),
    pickCurated('commodities', 0),
    pickCurated('forex', 0),
  ];
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

export function clearMarketNewsCache(): void {
  cache = null;
}
