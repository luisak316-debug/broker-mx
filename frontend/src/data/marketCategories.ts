export type MarketCategoryId = 'stocks' | 'commodities' | 'forex' | 'crypto';

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

export const INVESTMENT_AMOUNTS_MXN = [5_000, 20_000] as const;
export const INVESTMENT_HORIZONS_MONTHS = [1, 2, 4] as const;

export const MARKET_CATEGORIES: MarketCategoryInfo[] = [
  {
    id: 'stocks',
    title: 'Bolsa de Valores',
    shortDesc: 'Acciones de las empresas más grandes del mundo.',
    overview:
      'La bolsa te permite ser dueño parcial de empresas líderes en México y el mundo. Es el mercado ideal para hacer crecer tu patrimonio con dividendos, diversificación sectorial y liquidez diaria bajo asesoría profesional.',
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
    id: 'forex',
    title: 'Divisas (Forex)',
    shortDesc: 'Pares internacionales frente al peso mexicano.',
    overview:
      'El mercado de divisas mueve billones diarios y permite aprovechar movimientos del dólar, euro y otras monedas frente al peso. Es clave para cobertura cambiaria y oportunidades tácticas con gestión de riesgo.',
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
