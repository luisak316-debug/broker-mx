import type { MarketNewsItem } from '../types';

const now = () => new Date().toISOString();

/** Set A — imágenes premium (Salinas + Bitcoin, oro real, BMV, etc.) */
const MARKET_NEWS_SET_A: MarketNewsItem[] = [
  {
    id: 'featured-a',
    category: 'featured',
    categoryLabel: 'Destacado del día',
    title: 'Ricardo Salinas Pliego reafirma su confianza en Bitcoin como activo de largo plazo',
    summary:
      'El empresario mexicano destaca Bitcoin como reserva de valor sólida frente a la inflación y la incertidumbre global.',
    source: 'Medios financieros · MX',
    url: 'https://www.facebook.com/share/1FvLsLtL9K/',
    imageUrl: '/news/featured.jpg',
    publishedAt: now(),
  },
  {
    id: 'crypto-a',
    category: 'crypto',
    categoryLabel: 'Criptomonedas',
    title: 'Bitcoin mantiene interés institucional con nuevos flujos hacia ETFs spot',
    summary:
      'Los fondos cotizados en EE.UU. registran entradas netas que refuerzan la liquidez institucional del mercado.',
    source: 'CoinDesk',
    url: 'https://www.coindesk.com/',
    imageUrl: '/news/crypto.jpg',
    publishedAt: now(),
  },
  {
    id: 'stocks-a',
    category: 'stocks',
    categoryLabel: 'Bolsa de Valores',
    title: 'La Bolsa Mexicana muestra fortaleza con sectores exportadores en alza',
    summary:
      'Sectores industrial y manufacturero lideran las ganancias impulsados por la demanda externa y el nearshoring.',
    source: 'BMV · MX',
    url: 'https://www.facebook.com/share/1CwH13b7Bi/',
    imageUrl: '/news/stocks.jpg',
    publishedAt: now(),
  },
  {
    id: 'commodities-a',
    category: 'commodities',
    categoryLabel: 'Materias Primas',
    title: 'El oro refuerza su papel como resguardo patrimonial ante escenarios globales',
    summary:
      'La incertidumbre geopolítica y las expectativas de tasas impulsan la demanda del metal a niveles históricos.',
    source: 'Kitco',
    url: 'https://www.kitco.com/',
    imageUrl: '/news/commodities.jpg',
    publishedAt: now(),
  },
  {
    id: 'forex-a',
    category: 'forex',
    categoryLabel: 'Divisas (Forex)',
    title: 'Dólar-peso mantiene niveles operativos atractivos para diversificación',
    summary:
      'La relativa estabilidad del tipo de cambio abre ventanas tácticas para inversionistas en México.',
    source: 'DailyFX · MX',
    url: 'https://www.facebook.com/share/p/1EEUrFd29p/',
    imageUrl: '/news/forex.jpg',
    publishedAt: now(),
  },
];

/** Set B — titulares alternos con imágenes complementarias (rotación cada 2 min) */
const MARKET_NEWS_SET_B: MarketNewsItem[] = [
  {
    id: 'featured-b',
    category: 'featured',
    categoryLabel: 'Destacado del día',
    title: 'Bitcoin gana terreno como activo de reserva en carteras patrimoniales globales',
    summary:
      'Inversionistas institucionales amplían exposición digital como cobertura frente a escenarios macroeconómicos.',
    source: 'Bloomberg · MX',
    url: 'https://www.coindesk.com/',
    imageUrl: '/news/featured-alt.jpg',
    publishedAt: now(),
  },
  {
    id: 'crypto-b',
    category: 'crypto',
    categoryLabel: 'Criptomonedas',
    title: 'Ethereum consolida ecosistema DeFi con adopción creciente en finanzas digitales',
    summary:
      'La red líder en contratos inteligentes amplía casos de uso para inversionistas institucionales.',
    source: 'Cointelegraph',
    url: 'https://cointelegraph.com/',
    imageUrl: '/news/crypto.jpg',
    publishedAt: now(),
  },
  {
    id: 'stocks-b',
    category: 'stocks',
    categoryLabel: 'Bolsa de Valores',
    title: 'Wall Street cierra en terreno positivo impulsada por resultados corporativos sólidos',
    summary:
      'Grandes emisoras reportan ingresos por encima de expectativas, reforzando la confianza del mercado.',
    source: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/',
    imageUrl: '/news/stocks.jpg',
    publishedAt: now(),
  },
  {
    id: 'commodities-b',
    category: 'commodities',
    categoryLabel: 'Materias Primas',
    title: 'Metales preciosos y materias primas industriales captan flujos defensivos',
    summary:
      'Oro y plata siguen apoyados por inversionistas que buscan protección patrimonial en ciclos volátiles.',
    source: 'Reuters Commodities',
    url: 'https://www.kitco.com/',
    imageUrl: '/news/commodities-alt.jpg',
    publishedAt: now(),
  },
  {
    id: 'forex-b',
    category: 'forex',
    categoryLabel: 'Divisas (Forex)',
    title: 'Mercado Forex mexicano ofrece cobertura estratégica en pesos y dólares',
    summary:
      'Operadores aprovechan rangos técnicos para estrategias de diversificación y protección cambiaria.',
    source: 'Investing.com · MX',
    url: 'https://www.facebook.com/share/p/1EEUrFd29p/',
    imageUrl: '/news/forex.jpg',
    publishedAt: now(),
  },
];

/** Conjuntos que rotan en la landing (Salinas/Bitcoin ↔ variantes premium). */
export const MARKET_NEWS_ROTATION_SETS: MarketNewsItem[][] = [
  MARKET_NEWS_SET_A,
  MARKET_NEWS_SET_B,
];

/** Primer set visible al cargar — compatible con imports existentes. */
export const DEFAULT_MARKET_NEWS: MarketNewsItem[] = MARKET_NEWS_SET_A;

/** Intervalo de rotación en milisegundos (2 minutos). */
export const MARKET_NEWS_ROTATION_MS = 120_000;
