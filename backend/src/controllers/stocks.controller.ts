import type { Request, Response } from 'express';
import { DIVIDENDS, findInstrument } from '../data/instruments';
import { HttpError } from '../middleware/errorHandler';

export function getDividends(req: Request, res: Response): void {
  const symbol = req.params.symbol.toUpperCase();
  const inst = findInstrument(symbol);
  if (!inst || inst.assetClass !== 'stock') {
    throw new HttpError(404, `Acción no encontrada: ${symbol}`);
  }
  res.json({ data: DIVIDENDS[inst.symbol] ?? [] });
}
