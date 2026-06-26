import type { MarketNewsItem } from '../types';

/** Noticias premium en español (MX) — siempre visibles aunque la API tarde o falle. */
export const DEFAULT_MARKET_NEWS: MarketNewsItem[] = [
  {
    id: 'featured-local',
    category: 'featured',
    categoryLabel: 'Destacado del día',
    title: 'Ricardo Salinas Pliego reafirma su confianza en Bitcoin como activo de largo plazo',
    summary:
      'El empresario mexicano destaca la diversificación digital dentro de una estrategia patrimonial moderna.',
    source: 'Medios financieros · MX',
    url: 'https://www.facebook.com/share/1FvLsLtL9K/',
    imageUrl:
      'https://images.unsplash.com/photo-1642790106117-e829e014591b?auto=format&fit=crop&w=900&q=80',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'crypto-local',
    category: 'crypto',
    categoryLabel: 'Criptomonedas',
    title: 'Bitcoin mantiene interés institucional con nuevos flujos hacia ETFs spot',
    summary:
      'Los fondos cotizados continúan atrayendo capital de inversionistas de largo plazo en mercados globales.',
    source: 'CoinDesk',
    url: 'https://www.coindesk.com/',
    imageUrl:
      'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=700&q=80',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'stocks-local',
    category: 'stocks',
    categoryLabel: 'Bolsa de Valores',
    title: 'La Bolsa Mexicana muestra fortaleza con sectores exportadores en alza',
    summary:
      'Emisoras ligadas al nearshoring reflejan optimismo y liquidez favorable para inversionistas nacionales.',
    source: 'BMV · MX',
    url: 'https://www.facebook.com/share/1CwH13b7Bi/',
    imageUrl:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=700&q=80',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'commodities-local',
    category: 'commodities',
    categoryLabel: 'Materias Primas',
    title: 'El oro refuerza su papel como resguardo patrimonial ante escenarios globales',
    summary:
      'La demanda de metales preciosos sigue apoyada por inversionistas institucionales en México y el mundo.',
    source: 'Kitco',
    url: 'https://www.kitco.com/',
    imageUrl:
      'https://images.unsplash.com/photo-1610375461244-83ae109a751e?auto=format&fit=crop&w=700&q=80',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'forex-local',
    category: 'forex',
    categoryLabel: 'Divisas (Forex)',
    title: 'Dólar-peso mantiene niveles operativos atractivos para diversificación',
    summary:
      'El mercado Forex ofrece ventanas favorables para estrategias de cobertura patrimonial en pesos.',
    source: 'DailyFX · MX',
    url: 'https://www.facebook.com/share/p/1EEUrFd29p/',
    imageUrl:
      'https://images.unsplash.com/photo-1624996377900-f678ede0927a?auto=format&fit=crop&w=700&q=80',
    publishedAt: new Date().toISOString(),
  },
];
