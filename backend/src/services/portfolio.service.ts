import { randomUUID } from 'node:crypto';
import { findInstrument } from '../data/instruments';
import { marketData } from './marketData.service';
import type {
  OrderSide,
  PositionDirection,
  SimulatedOrder,
} from '../types/market';

export interface Position {
  symbol: string;
  direction: PositionDirection;
  quantity: number;
  avgPrice: number; // en moneda del instrumento
  notionalMxn: number;
}

export interface Portfolio {
  userId: string;
  cashMxn: number;
  positions: Position[];
  orders: SimulatedOrder[];
}

/**
 * Almacén en memoria de portafolios simulados. La capa de persistencia real
 * está modelada en Prisma (ver prisma/schema.prisma). Este servicio se
 * sustituiría por repositorios respaldados por la base de datos.
 */
class PortfolioService {
  private portfolios = new Map<string, Portfolio>();

  /** Tipo de cambio del instrumento a MXN usando el feed simulado. */
  private fxToMxn(instrumentCurrency: string): number {
    if (instrumentCurrency === 'MXN') return 1;
    const pair = `${instrumentCurrency}/MXN`;
    const quote = marketData.getQuote(pair);
    if (quote) return quote.price;
    // Respaldo aproximado si no existe el par directo.
    const usdMxn = marketData.getQuote('USD/MXN')?.price ?? 18.5;
    return usdMxn;
  }

  getOrCreate(userId: string): Portfolio {
    let p = this.portfolios.get(userId);
    if (!p) {
      p = { userId, cashMxn: 100_000, positions: [], orders: [] };
      this.portfolios.set(userId, p);
    }
    return p;
  }

  placeOrder(params: {
    userId: string;
    symbol: string;
    side: OrderSide;
    direction: PositionDirection;
    quantity: number;
  }): { order: SimulatedOrder; portfolio: Portfolio } {
    const { userId, symbol, side, direction, quantity } = params;
    if (quantity <= 0) throw new Error('La cantidad debe ser mayor a cero.');

    const inst = findInstrument(symbol);
    if (!inst) throw new Error(`Instrumento no encontrado: ${symbol}`);

    const quote = marketData.getQuote(symbol);
    if (!quote) throw new Error(`Sin cotización disponible para ${symbol}`);

    const fillPrice = side === 'buy' ? quote.ask : quote.bid;
    const fx = this.fxToMxn(inst.currency);
    const notionalMxn = Number((fillPrice * quantity * fx).toFixed(2));

    const portfolio = this.getOrCreate(userId);

    // Validación de fondos para aperturas de compra (long).
    if (side === 'buy' && notionalMxn > portfolio.cashMxn) {
      throw new Error('Fondos insuficientes (saldo simulado en MXN).');
    }

    portfolio.cashMxn = Number(
      (portfolio.cashMxn + (side === 'buy' ? -notionalMxn : notionalMxn)).toFixed(2),
    );

    this.applyToPositions(portfolio, {
      symbol,
      direction,
      side,
      quantity,
      price: fillPrice,
      notionalMxn,
    });

    const order: SimulatedOrder = {
      id: randomUUID(),
      userId,
      symbol,
      assetClass: inst.assetClass,
      side,
      direction,
      quantity,
      price: fillPrice,
      notionalMxn,
      createdAt: new Date().toISOString(),
    };
    portfolio.orders.unshift(order);
    return { order, portfolio };
  }

  private applyToPositions(
    portfolio: Portfolio,
    fill: { symbol: string; direction: PositionDirection; side: OrderSide; quantity: number; price: number; notionalMxn: number },
  ): void {
    const existing = portfolio.positions.find(
      (p) => p.symbol === fill.symbol && p.direction === fill.direction,
    );
    const opening =
      (fill.direction === 'long' && fill.side === 'buy') ||
      (fill.direction === 'short' && fill.side === 'sell');

    if (opening) {
      if (existing) {
        const totalQty = existing.quantity + fill.quantity;
        existing.avgPrice = Number(
          ((existing.avgPrice * existing.quantity + fill.price * fill.quantity) / totalQty).toFixed(6),
        );
        existing.quantity = totalQty;
        existing.notionalMxn = Number((existing.notionalMxn + fill.notionalMxn).toFixed(2));
      } else {
        portfolio.positions.push({
          symbol: fill.symbol,
          direction: fill.direction,
          quantity: fill.quantity,
          avgPrice: fill.price,
          notionalMxn: fill.notionalMxn,
        });
      }
    } else if (existing) {
      existing.quantity = Math.max(0, existing.quantity - fill.quantity);
      if (existing.quantity === 0) {
        portfolio.positions = portfolio.positions.filter((p) => p !== existing);
      }
    }
  }
}

export const portfolioService = new PortfolioService();
