import type { MarketNewsItem } from '../types';

const now = () => new Date().toISOString();

/** Titulares destacados del día — respaldo local (Investing.com vía API). */
export const FEATURED_DAILY_NEWS: MarketNewsItem[] = [
  {
    id: 'featured-stocks-fallback',
    category: 'featured',
    themeCategory: 'stocks',
    categoryLabel: 'Mercados a la baja',
    title: 'Cadence y Synopsys caen mientras la innovación en semiconductores redefine el sector',
    summary:
      'El mercado de acciones tecnológicas reacciona a nuevos modelos de diseño de chips y presiones competitivas.',
    source: 'Investing.com · Actualizado hoy',
    url: 'https://es.investing.com/news/',
    imageUrl: '/news/featured-stocks.jpg',
    publishedAt: now(),
    trend: 'down',
  },
  {
    id: 'featured-crypto-fallback',
    category: 'featured',
    themeCategory: 'crypto',
    categoryLabel: 'Mercados al alza',
    title: 'Bitcoin consolida niveles clave mientras el flujo institucional define la tendencia',
    summary:
      'El mercado cripto observa volatilidad moderada con foco en ETFs y liquidez global.',
    source: 'Investing.com · Actualizado hoy',
    url: 'https://es.investing.com/news/',
    imageUrl: '/news/crypto.jpg',
    publishedAt: now(),
    trend: 'up',
  },
  {
    id: 'featured-commodities-fallback',
    category: 'featured',
    themeCategory: 'commodities',
    categoryLabel: 'Mercados al alza',
    title: 'El oro refuerza su papel como resguardo patrimonial ante escenarios globales',
    summary:
      'La incertidumbre geopolítica impulsa la demanda del metal entre inversionistas defensivos.',
    source: 'Investing.com · Actualizado hoy',
    url: 'https://es.investing.com/news/',
    imageUrl: '/news/commodities.jpg',
    publishedAt: now(),
    trend: 'up',
  },
  {
    id: 'featured-forex-fallback',
    category: 'featured',
    themeCategory: 'forex',
    categoryLabel: 'Mercados a la baja',
    title: 'El dólar se fortalece frente a divisas emergentes en jornada de ajuste cambiario',
    summary:
      'Los pares FX reflejan expectativas sobre tasas e inflación en las principales economías.',
    source: 'Investing.com · Actualizado hoy',
    url: 'https://es.investing.com/news/',
    imageUrl: '/news/forex.jpg',
    publishedAt: now(),
    trend: 'down',
  },
  {
    id: 'featured-stocks-bmv',
    category: 'featured',
    themeCategory: 'stocks',
    categoryLabel: 'Mercados al alza',
    title: 'La Bolsa Mexicana encabeza rally exportador impulsado por nearshoring e inversión extranjera',
    summary:
      'Emisoras industriales y del IPC muestran liquidez favorable para inversionistas patrimoniales.',
    source: 'Investing.com · Actualizado hoy',
    url: 'https://es.investing.com/news/',
    imageUrl: '/news/stocks.jpg',
    publishedAt: now(),
    trend: 'up',
  },
];

/** Referencia de credibilidad en Quiénes Somos (no rota en destacado). */
export const SALINAS_CREDIBILITY_NEWS: MarketNewsItem = {
  id: 'featured-crypto-salinas',
  category: 'featured',
  themeCategory: 'crypto',
  categoryLabel: 'Referencia · México',
  title: 'Ricardo Salinas Pliego reafirma su confianza en Bitcoin como activo de largo plazo',
  summary:
    'El empresario mexicano destaca Bitcoin como reserva de valor sólida frente a la inflación y la incertidumbre global.',
  source: 'Medios financieros · MX',
  url: 'https://www.facebook.com/share/1FvLsLtL9K/',
  imageUrl: '/news/featured.jpg',
  publishedAt: now(),
};

/** Cuatro tarjetas fijas de mercado (móvil y escritorio). */
export const MARKET_NEWS_GRID: MarketNewsItem[] = [
  {
    id: 'crypto-grid',
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
    id: 'stocks-grid',
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
    id: 'commodities-grid',
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
    id: 'forex-grid',
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

/** Primer render — compatible con imports existentes. */
export const DEFAULT_MARKET_NEWS: MarketNewsItem[] = [
  FEATURED_DAILY_NEWS[0],
  ...MARKET_NEWS_GRID,
];

/** Intervalo de rotación del destacado (2 minutos). */
export const MARKET_NEWS_ROTATION_MS = 120_000;
