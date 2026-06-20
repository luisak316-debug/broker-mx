import type { Request, Response } from 'express';
import { ALL_INSTRUMENTS } from '../data/instruments';
import { marketData } from '../services/marketData.service';
import { HttpError } from '../middleware/errorHandler';
import type { AssetClass } from '../types/market';

export function listInstruments(req: Request, res: Response): void {
  const assetClass = req.query.assetClass as AssetClass | undefined;
  const group = req.query.group as string | undefined;
  let items = ALL_INSTRUMENTS;
  if (assetClass) items = items.filter((i) => i.assetClass === assetClass);
  if (group) items = items.filter((i) => (i.meta?.group as string) === group);
  res.json({ data: items });
}

export function getQuotes(req: Request, res: Response): void {
  const symbolsParam = req.query.symbols as string | undefined;
  const symbols = symbolsParam ? symbolsParam.split(',').map((s) => s.trim()) : undefined;
  res.json({ data: marketData.getQuotes(symbols) });
}

export function getQuote(req: Request, res: Response): void {
  const quote = marketData.getQuote(req.params.symbol);
  if (!quote) throw new HttpError(404, `Sin cotización para ${req.params.symbol}`);
  res.json({ data: quote });
}

export function getCandles(req: Request, res: Response): void {
  const points = Number(req.query.points ?? 120);
  const step = Number(req.query.step ?? 3600);
  const candles = marketData.getCandles(req.params.symbol, points, step);
  if (!candles.length) throw new HttpError(404, `Sin histórico para ${req.params.symbol}`);
  res.json({ data: candles });
}
