import type { Request, Response } from 'express';
import { z } from 'zod';
import { portfolioService } from '../services/portfolio.service';
import { marketData } from '../services/marketData.service';
import { findInstrument } from '../data/instruments';

const orderSchema = z.object({
  userId: z.string().min(1).default('demo-user'),
  symbol: z.string().min(1),
  side: z.enum(['buy', 'sell']),
  direction: z.enum(['long', 'short']),
  quantity: z.number().positive(),
});

export function placeOrder(req: Request, res: Response): void {
  const parsed = orderSchema.parse(req.body);
  const result = portfolioService.placeOrder(parsed);
  res.status(201).json({ data: result });
}

export function getPortfolio(req: Request, res: Response): void {
  const userId = req.params.userId || 'demo-user';
  const portfolio = portfolioService.getOrCreate(userId);

  // Valuación a mercado (P&L no realizado) de las posiciones abiertas.
  const positions = portfolio.positions.map((pos) => {
    const inst = findInstrument(pos.symbol);
    const quote = marketData.getQuote(pos.symbol);
    const last = quote?.price ?? pos.avgPrice;
    const grossPnl =
      pos.direction === 'long'
        ? (last - pos.avgPrice) * pos.quantity
        : (pos.avgPrice - last) * pos.quantity;
    return {
      ...pos,
      name: inst?.name,
      assetClass: inst?.assetClass,
      lastPrice: last,
      unrealizedPnl: Number(grossPnl.toFixed(2)),
    };
  });

  const equityExposureMxn = positions.reduce((acc, p) => acc + p.notionalMxn, 0);
  res.json({
    data: {
      userId,
      cashMxn: portfolio.cashMxn,
      equityExposureMxn: Number(equityExposureMxn.toFixed(2)),
      positions,
      orders: portfolio.orders.slice(0, 50),
    },
  });
}
