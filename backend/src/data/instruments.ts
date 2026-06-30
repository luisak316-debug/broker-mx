import type { Instrument, DividendRecord } from '../types/market';

/**
 * Catálogo de instrumentos simulados. En producción este catálogo provendría
 * de un proveedor de datos de mercado (p. ej. Refinitiv, Polygon, Bitso, etc.).
 */

export const STOCKS: Instrument[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'stock', currency: 'USD', basePrice: 212.5, volatility: 0.012, meta: { sector: 'Tecnología', exchange: 'NASDAQ' } },
  { symbol: 'MSFT', name: 'Microsoft Corp.', assetClass: 'stock', currency: 'USD', basePrice: 438.9, volatility: 0.011, meta: { sector: 'Tecnología', exchange: 'NASDAQ' } },
  { symbol: 'AMXB.MX', name: 'América Móvil S.A.B.', assetClass: 'stock', currency: 'MXN', basePrice: 16.4, volatility: 0.014, meta: { sector: 'Telecomunicaciones', exchange: 'BMV' } },
  { symbol: 'WALMEX.MX', name: 'Walmart de México', assetClass: 'stock', currency: 'MXN', basePrice: 58.7, volatility: 0.01, meta: { sector: 'Consumo', exchange: 'BMV' } },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', assetClass: 'stock', currency: 'USD', basePrice: 131.2, volatility: 0.02, meta: { sector: 'Semiconductores', exchange: 'NASDAQ' } },
  { symbol: 'GFNORTEO.MX', name: 'Grupo Financiero Banorte', assetClass: 'stock', currency: 'MXN', basePrice: 142.3, volatility: 0.013, meta: { sector: 'Financiero', exchange: 'BMV' } },
];

export const COMMODITIES: Instrument[] = [
  // Metales
  { symbol: 'XAU', name: 'Oro (Spot)', assetClass: 'commodity', currency: 'USD', basePrice: 2650.0, volatility: 0.008, meta: { group: 'metals', unit: 'onza troy', contract: 'GC=F' } },
  { symbol: 'XAG', name: 'Plata (Spot)', assetClass: 'commodity', currency: 'USD', basePrice: 31.2, volatility: 0.015, meta: { group: 'metals', unit: 'onza troy', contract: 'SI=F' } },
  { symbol: 'HG', name: 'Cobre', assetClass: 'commodity', currency: 'USD', basePrice: 4.15, volatility: 0.013, meta: { group: 'metals', unit: 'libra', contract: 'HG=F' } },
  // Energía
  { symbol: 'BRENT', name: 'Petróleo Brent', assetClass: 'commodity', currency: 'USD', basePrice: 74.8, volatility: 0.018, meta: { group: 'energy', unit: 'barril', contract: 'BZ=F' } },
  { symbol: 'WTI', name: 'Petróleo WTI', assetClass: 'commodity', currency: 'USD', basePrice: 70.5, volatility: 0.019, meta: { group: 'energy', unit: 'barril', contract: 'CL=F' } },
  // Agrícolas
  { symbol: 'KC', name: 'Café Arábica', assetClass: 'commodity', currency: 'USD', basePrice: 3.25, volatility: 0.022, meta: { group: 'agricultural', unit: 'libra', contract: 'KC=F' } },
  { symbol: 'ZC', name: 'Maíz', assetClass: 'commodity', currency: 'USD', basePrice: 4.45, volatility: 0.016, meta: { group: 'agricultural', unit: 'bushel', contract: 'ZC=F' } },
];

export const FOREX: Instrument[] = [
  { symbol: 'USD/MXN', name: 'Dólar / Peso Mexicano', assetClass: 'forex', currency: 'MXN', basePrice: 18.45, volatility: 0.006, meta: { base: 'USD', quote: 'MXN', defaultSpread: 0.04 } },
  { symbol: 'EUR/MXN', name: 'Euro / Peso Mexicano', assetClass: 'forex', currency: 'MXN', basePrice: 19.95, volatility: 0.007, meta: { base: 'EUR', quote: 'MXN', defaultSpread: 0.05 } },
  { symbol: 'EUR/USD', name: 'Euro / Dólar', assetClass: 'forex', currency: 'USD', basePrice: 1.0812, volatility: 0.005, meta: { base: 'EUR', quote: 'USD', defaultSpread: 0.00015 } },
  { symbol: 'GBP/USD', name: 'Libra / Dólar', assetClass: 'forex', currency: 'USD', basePrice: 1.2685, volatility: 0.006, meta: { base: 'GBP', quote: 'USD', defaultSpread: 0.0002 } },
  { symbol: 'USD/JPY', name: 'Dólar / Yen', assetClass: 'forex', currency: 'JPY', basePrice: 149.85, volatility: 0.006, meta: { base: 'USD', quote: 'JPY', defaultSpread: 0.02 } },
  { symbol: 'EUR/GBP', name: 'Euro / Libra', assetClass: 'forex', currency: 'GBP', basePrice: 0.8525, volatility: 0.005, meta: { base: 'EUR', quote: 'GBP', defaultSpread: 0.00012 } },
  { symbol: 'USD/CAD', name: 'Dólar / Dólar Canadiense', assetClass: 'forex', currency: 'CAD', basePrice: 1.3625, volatility: 0.005, meta: { base: 'USD', quote: 'CAD', defaultSpread: 0.00018 } },
  { symbol: 'JPY/MXN', name: 'Yen / Peso Mexicano', assetClass: 'forex', currency: 'MXN', basePrice: 0.121, volatility: 0.008, meta: { base: 'JPY', quote: 'MXN', defaultSpread: 0.0008 } },
  { symbol: 'GBP/MXN', name: 'Libra / Peso Mexicano', assetClass: 'forex', currency: 'MXN', basePrice: 23.4, volatility: 0.007, meta: { base: 'GBP', quote: 'MXN', defaultSpread: 0.06 } },
];

export const CRYPTO: Instrument[] = [
  { symbol: 'BTC', name: 'Bitcoin', assetClass: 'crypto', currency: 'USD', basePrice: 96500, volatility: 0.025, meta: { exchange: 'Bitso/Binance', pairMxn: 'BTC/MXN' } },
  { symbol: 'ETH', name: 'Ethereum', assetClass: 'crypto', currency: 'USD', basePrice: 3380, volatility: 0.03, meta: { exchange: 'Bitso/Binance', pairMxn: 'ETH/MXN' } },
  { symbol: 'SOL', name: 'Solana', assetClass: 'crypto', currency: 'USD', basePrice: 188, volatility: 0.045, meta: { exchange: 'Bitso/Binance', pairMxn: 'SOL/MXN' } },
  { symbol: 'XRP', name: 'XRP', assetClass: 'crypto', currency: 'USD', basePrice: 2.35, volatility: 0.05, meta: { exchange: 'Bitso/Binance', pairMxn: 'XRP/MXN' } },
];

export const ALL_INSTRUMENTS: Instrument[] = [...STOCKS, ...COMMODITIES, ...FOREX, ...CRYPTO];

export function findInstrument(symbol: string): Instrument | undefined {
  return ALL_INSTRUMENTS.find((i) => i.symbol.toUpperCase() === symbol.toUpperCase());
}

/** Historial de dividendos simulado por acción (Módulo Bolsa de Valores). */
export const DIVIDENDS: Record<string, DividendRecord[]> = {
  AAPL: [
    { exDate: '2025-11-08', paymentDate: '2025-11-14', amountPerShare: 0.25, currency: 'USD', yieldPct: 0.47 },
    { exDate: '2025-08-09', paymentDate: '2025-08-15', amountPerShare: 0.25, currency: 'USD', yieldPct: 0.48 },
    { exDate: '2025-05-10', paymentDate: '2025-05-16', amountPerShare: 0.24, currency: 'USD', yieldPct: 0.46 },
  ],
  MSFT: [
    { exDate: '2025-11-20', paymentDate: '2025-12-12', amountPerShare: 0.83, currency: 'USD', yieldPct: 0.76 },
    { exDate: '2025-08-21', paymentDate: '2025-09-12', amountPerShare: 0.83, currency: 'USD', yieldPct: 0.78 },
    { exDate: '2025-05-15', paymentDate: '2025-06-12', amountPerShare: 0.75, currency: 'USD', yieldPct: 0.71 },
  ],
  'AMXB.MX': [
    { exDate: '2025-11-03', paymentDate: '2025-11-10', amountPerShare: 0.32, currency: 'MXN', yieldPct: 1.95 },
    { exDate: '2025-05-05', paymentDate: '2025-05-12', amountPerShare: 0.4, currency: 'MXN', yieldPct: 2.44 },
  ],
  'WALMEX.MX': [
    { exDate: '2025-12-01', paymentDate: '2025-12-09', amountPerShare: 0.65, currency: 'MXN', yieldPct: 1.1 },
    { exDate: '2025-08-18', paymentDate: '2025-08-25', amountPerShare: 0.62, currency: 'MXN', yieldPct: 1.05 },
  ],
  'GFNORTEO.MX': [
    { exDate: '2025-10-15', paymentDate: '2025-10-22', amountPerShare: 7.5, currency: 'MXN', yieldPct: 5.27 },
  ],
  NVDA: [
    { exDate: '2025-12-05', paymentDate: '2025-12-27', amountPerShare: 0.01, currency: 'USD', yieldPct: 0.03 },
  ],
};
