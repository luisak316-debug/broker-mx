import type { MarketCategoryId } from './marketCategories';

export const LANDING_INSTRUMENTS: Record<MarketCategoryId, string[]> = {
  forex: ['USD/MXN', 'EUR/MXN', 'GBP/MXN', 'JPY/MXN', 'EUR/USD', 'GBP/USD', 'USD/JPY'],
  commodities: ['XAU', 'XAG', 'WTI', 'Brent', 'Cobre', 'Gas natural', 'Platino', 'Café', 'Maíz'],
  stocks: ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'META', 'AMZN', 'AMD', 'PLTR', 'MU', 'INTC'],
  indexes: ['S&P 500', 'NASDAQ 100', 'Dow Jones', 'IPC México', 'DAX 40', 'FTSE 100'],
  crypto: ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'BNB', 'AVAX', 'LINK', 'DOT'],
};
