export type AssetClass = 'stock' | 'commodity' | 'forex' | 'crypto' | 'index';

export type CommodityGroup = 'metals' | 'energy' | 'agricultural';

export interface Instrument {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  currency: string;
  /** Precio de referencia inicial para la simulación */
  basePrice: number;
  /** Volatilidad relativa por tick (0-1) para la simulación de precios */
  volatility: number;
  /** Metadatos específicos por clase de activo */
  meta?: Record<string, unknown>;
}

export interface Quote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  changeAbs: number;
  changePct: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  updatedAt: string;
}

export interface Candle {
  time: number; // epoch seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DividendRecord {
  exDate: string;
  paymentDate: string;
  amountPerShare: number;
  currency: string;
  yieldPct: number;
}

export type OrderSide = 'buy' | 'sell';
export type PositionDirection = 'long' | 'short';

export interface SimulatedOrder {
  id: string;
  userId: string;
  symbol: string;
  assetClass: AssetClass;
  side: OrderSide;
  direction: PositionDirection;
  quantity: number;
  price: number;
  notionalMxn: number;
  createdAt: string;
}
