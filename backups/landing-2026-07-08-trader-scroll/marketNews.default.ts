import type { MarketNewsItem } from '../types';

const now = () => new Date().toISOString();

/** 5 titulares destacados del día — rotan cada 2 min (uno por mercado + cripto extra). */
export const FEATURED_DAILY_NEWS: MarketNewsItem[] = [
  {
    id: 'featured-crypto-salinas',
    category: 'featured',
    themeCategory: 'crypto',
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
    id: 'featured-stocks-bmv',
    category: 'featured',
    themeCategory: 'stocks',
    categoryLabel: 'Destacado del día',
    title: 'La Bolsa Mexicana encabeza rally exportador impulsado por nearshoring e inversión extranjera',
    summary:
      'Emisoras industriales y del IPC muestran liquidez favorable, abriendo oportunidades para inversionistas patrimoniales.',
    source: 'BMV · MX',
    url: 'https://www.facebook.com/share/1CwH13b7Bi/',
    imageUrl: '/news/featured-stocks.jpg',
    publishedAt: now(),
  },
  {
    id: 'featured-commodities-gold',
    category: 'featured',
    themeCategory: 'commodities',
    categoryLabel: 'Destacado del día',
    title: 'El oro refuerza su papel como resguardo patrimonial ante escenarios globales',
    summary:
      'La incertidumbre geopolítica y las expectativas de tasas impulsan la demanda del metal a niveles históricos.',
    source: 'Kitco · MX',
    url: 'https://www.kitco.com/',
    imageUrl: '/news/commodities.jpg',
    publishedAt: now(),
  },
  {
    id: 'featured-forex-usdmxn',
    category: 'featured',
    themeCategory: 'forex',
    categoryLabel: 'Destacado del día',
    title: 'Dólar-peso abre ventana estratégica para diversificación y cobertura cambiaria',
    summary:
      'La estabilidad relativa del par USD/MXN favorece estrategias tácticas de protección patrimonial en pesos.',
    source: 'DailyFX · MX',
    url: 'https://www.facebook.com/share/p/1EEUrFd29p/',
    imageUrl: '/news/featured-forex.jpg',
    publishedAt: now(),
  },
  {
    id: 'featured-crypto-btc',
    category: 'featured',
    themeCategory: 'crypto',
    categoryLabel: 'Destacado del día',
    title: 'Bitcoin gana terreno como activo de reserva en carteras institucionales globales',
    summary:
      'ETFs spot y flujos corporativos consolidan a la cripto como pilar de diversificación de largo plazo.',
    source: 'Bloomberg · MX',
    url: 'https://www.coindesk.com/',
    imageUrl: '/news/featured-alt.jpg',
    publishedAt: now(),
  },
];

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
