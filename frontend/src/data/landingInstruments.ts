import type { MarketCategoryId } from './marketCategories';

export const LANDING_INSTRUMENTS: Record<MarketCategoryId, string[]> = {
  stocks: ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'META', 'AMZN', 'AMD', 'PLTR', 'MU', 'INTC'],
  commodities: ['XAU', 'XAG', 'WTI', 'Brent', 'Cobre', 'Gas natural', 'Platino', 'Café', 'Maíz'],
  forex: ['USD/MXN', 'EUR/MXN', 'GBP/MXN', 'JPY/MXN', 'EUR/USD', 'GBP/USD', 'USD/JPY'],
  crypto: ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'BNB', 'AVAX', 'LINK', 'DOT'],
};
