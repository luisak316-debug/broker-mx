export type MarketCategoryId = 'forex' | 'commodities' | 'stocks' | 'indexes' | 'crypto';

export interface MarketCategoryInfo {
  id: MarketCategoryId;
  title: string;
  shortDesc: string;
  overview: string;
  bullets: string[];
  /** Rendimiento anual histórico promedio conservador (referencia para la simulación). */
  annualReturnPct: number;
  accentBorder: string;
  accentBg: string;
  accentText: string;
}

export const INVESTMENT_AMOUNTS_USD = [1_000, 3_000, 5_000, 20_000] as const;
/** @deprecated Usar INVESTMENT_AMOUNTS_USD */
export const INVESTMENT_AMOUNTS_MXN = INVESTMENT_AMOUNTS_USD;
export const INVESTMENT_HORIZONS_MONTHS = [1, 2, 4] as const;

/** Orden fijo: Divisas → Materias Primas → Acciones → Índices → Cripto */
export const MARKET_CATEGORIES: MarketCategoryInfo[] = [
  {
    id: 'forex',
    title: 'Divisas (Forex)',
    shortDesc: 'Pares internacionales y tipos de cambio.',
    overview:
      'El mercado de divisas mueve billones diarios y permite aprovechar movimientos del dólar, euro y otras monedas. Es clave para cobertura cambiaria y oportunidades tácticas con gestión de riesgo.',
    bullets: [
      'Operación en USD/MXN y pares internacionales relevantes',
      'Estrategias de cobertura para importadores, ahorradores e inversionistas',
      'Alta liquidez en ventanas operativas globales',
    ],
    annualReturnPct: 6.0,
    accentBorder: 'border-emerald-500/40',
    accentBg: 'bg-emerald-600/15',
    accentText: 'text-emerald-300',
  },
  {
    id: 'commodities',
    title: 'Materias Primas',
    shortDesc: 'Oro, plata, petróleo y commodities agrícolas.',
    overview:
      'Las materias primas protegen tu capital en ciclos de incertidumbre. Oro, plata y energía son activos tangibles que muchos inversionistas usan como resguardo patrimonial frente a la inflación y volatilidad global.',
    bullets: [
      'Oro y plata como cobertura ante escenarios macroeconómicos',
      'Exposición a energía y agricultura con estrategia diversificada',
      'Complemento defensivo dentro de un portafolio balanceado',
    ],
    annualReturnPct: 7.2,
    accentBorder: 'border-yellow-500/40',
    accentBg: 'bg-yellow-600/15',
    accentText: 'text-yellow-300',
  },
  {
    id: 'stocks',
    title: 'Acciones',
    shortDesc: 'Emisoras líderes en México y el mundo.',
    overview:
      'Invierte en acciones de empresas sólidas en México y mercados globales. Es el camino clásico para hacer crecer tu patrimonio con dividendos, diversificación sectorial y liquidez diaria bajo asesoría profesional.',
    bullets: [
      'Acceso a emisoras del IPC, EE.UU. y sectores exportadores',
      'Diversificación en industrial, tecnología, consumo y finanzas',
      'Horizonte recomendado: mediano y largo plazo',
    ],
    annualReturnPct: 10.5,
    accentBorder: 'border-sky-500/40',
    accentBg: 'bg-sky-600/15',
    accentText: 'text-sky-300',
  },
  {
    id: 'indexes',
    title: 'Índices Bursátiles',
    shortDesc: 'S&P 500, NASDAQ, IPC y otros índices globales.',
    overview:
      'Los índices bursátiles reflejan el pulso de economías enteras. Permiten invertir en la tendencia de mercados como el S&P 500, NASDAQ o el IPC mexicano con una sola exposición diversificada.',
    bullets: [
      'S&P 500, NASDAQ 100, Dow Jones, IPC México y más',
      'Diversificación instantánea en decenas o cientos de emisoras',
      'Ideal para seguir la tendencia macro con horizonte de mediano plazo',
    ],
    annualReturnPct: 9.0,
    accentBorder: 'border-cyan-500/40',
    accentBg: 'bg-cyan-600/15',
    accentText: 'text-cyan-300',
  },
  {
    id: 'crypto',
    title: 'Criptomonedas',
    shortDesc: 'Bitcoin, Ethereum y más, operando 24/7.',
    overview:
      'Las criptomonedas representan la nueva frontera de la inversión digital. Bitcoin y Ethereum ofrecen exposición a un ecosistema global que opera las 24 horas, con potencial de crecimiento en carteras diversificadas.',
    bullets: [
      'Acceso a Bitcoin, Ethereum y activos digitales líderes',
      'Mercado activo 24/7 con alta adopción institucional',
      'Componente de crecimiento dentro de una estrategia patrimonial',
    ],
    annualReturnPct: 12.5,
    accentBorder: 'border-amber-500/40',
    accentBg: 'bg-amber-600/15',
    accentText: 'text-amber-300',
  },
];

export function getMarketCategory(id: MarketCategoryId): MarketCategoryInfo {
  return MARKET_CATEGORIES.find((m) => m.id === id) ?? MARKET_CATEGORIES[0];
}
