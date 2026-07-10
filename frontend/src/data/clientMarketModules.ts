import type { NavIconId } from '../components/layout/NavIcons';
import type { AssetClass } from '../types';

/** Orden fijo de las 5 categorías de inversión en la cuenta del cliente. */
export const CLIENT_MARKET_MODULES: Array<{
  to: string;
  label: string;
  short: string;
  title: string;
  desc: string;
  iconId: NavIconId;
  cls: AssetClass;
}> = [
  {
    to: '/app/forex',
    label: 'Divisas (Forex)',
    short: 'Divisas',
    title: 'Divisas (Forex)',
    desc: 'Pares de monedas y tipos de cambio en tiempo real',
    iconId: 'forex',
    cls: 'forex',
  },
  {
    to: '/app/commodities',
    label: 'Materias Primas',
    short: 'Materias',
    title: 'Materias Primas',
    desc: 'Metales, energía y agrícolas',
    iconId: 'commodities',
    cls: 'commodity',
  },
  {
    to: '/app/acciones',
    label: 'Acciones',
    short: 'Acciones',
    title: 'Acciones',
    desc: 'Emisoras, gráficos y dividendos',
    iconId: 'stocks',
    cls: 'stock',
  },
  {
    to: '/app/indices',
    label: 'Índices Bursátiles',
    short: 'Índices',
    title: 'Índices Bursátiles',
    desc: 'S&P 500, NASDAQ, IPC y otros índices globales',
    iconId: 'indexes',
    cls: 'index',
  },
  {
    to: '/app/cripto',
    label: 'Criptomonedas',
    short: 'Cripto',
    title: 'Criptomonedas',
    desc: 'Mercado digital 24/7',
    iconId: 'crypto',
    cls: 'crypto',
  },
];

export const CLIENT_MARKET_NAV = CLIENT_MARKET_MODULES.map(({ to, label, short, iconId }) => ({
  to,
  label,
  short,
  iconId,
}));
