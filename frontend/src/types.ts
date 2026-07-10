export type AssetClass = 'stock' | 'commodity' | 'forex' | 'crypto' | 'index';

export interface Instrument {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  currency: string;
  basePrice: number;
  volatility: number;
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
  time: number;
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

export interface CommodityAlert {
  symbol: string;
  name: string;
  group: string;
  changePct: number;
  price: number;
  severity: 'normal' | 'media' | 'alta';
  triggered: boolean;
}

export type OrderSide = 'buy' | 'sell';
export type PositionDirection = 'long' | 'short';

export interface Position {
  symbol: string;
  name?: string;
  assetClass?: AssetClass;
  direction: PositionDirection;
  quantity: number;
  avgPrice: number;
  lastPrice: number;
  notionalMxn: number;
  unrealizedPnl: number;
}

export interface ClientSession {
  id: string;
  email: string;
  phone: string;
  countryCode: string;
  currency: string;
  displayName: string;
  city?: string;
  homeAddress?: string;
  kycStatus?: string;
  profilePhotoUrl?: string;
}

export type DocumentType = 'INE' | 'PASAPORTE' | 'COMPROBANTE_DOMICILIO' | 'CONSTANCIA_FISCAL';
export type DocumentStatus = 'EN_REVISION' | 'VALIDADO' | 'RECHAZADO';

export type DocumentSide = 'ANVERSO' | 'REVERSO';

export interface ClientDocument {
  id: string;
  type: DocumentType;
  side?: DocumentSide;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  status: DocumentStatus;
  uploadedAt: string;
  uploadedByName?: string;
  previewUrl?: string;
}

export interface ClientProfileData {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  city: string;
  homeAddress: string;
  kycStatus: string;
  profilePhotoUrl: string;
  documents: ClientDocument[];
  createdAt: string;
}

export interface SendOtpResult {
  message: string;
  expiresInSeconds: number;
  maskedPhone: string;
  debugCode?: string;
}

export interface AuthResult {
  token: string;
  client: ClientSession;
  redirectTo: string;
}

export type DepositMethod = 'TRANSFERENCIA' | 'TARJETA' | 'VENTANILLA' | 'OXXO';

export interface DepositAccount {
  depositMethod: DepositMethod;
  beneficiary: string;
  bank: string;
  accountNumber: string;
  clabe: string;
  reference: string;
  initialInvestmentMxn?: number;
  updatedAt?: string;
  updatedByName?: string;
}

export interface DepositAccountInfo {
  clientName: string;
  assigned: boolean;
  account: DepositAccount | null;
}

export interface PortfolioSummary {
  userId: string;
  cashMxn: number;
  currency: string;
  equityExposureMxn: number;
  positions: Position[];
  orders: Array<{
    id: string;
    symbol: string;
    side: OrderSide;
    direction: PositionDirection;
    quantity: number;
    price: number;
    notionalMxn: number;
    createdAt: string;
  }>;
}

export type MarketNewsCategory = 'featured' | 'crypto' | 'stocks' | 'commodities' | 'forex';

export interface MarketNewsItem {
  id: string;
  category: MarketNewsCategory;
  /** Color/icon del badge cuando category es "featured" (mercado del titular). */
  themeCategory?: MarketNewsCategory;
  categoryLabel: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface MarketNewsResponse {
  updatedAt: string;
  dateKey: string;
  items: MarketNewsItem[];
}
