import type { Request, Response } from 'express';
import { marketData } from '../services/marketData.service';
import { HttpError } from '../middleware/errorHandler';

/**
 * Calculadora de tipo de cambio en tiempo real con spread configurable.
 * Ejemplo: GET /api/forex/convert?pair=USD/MXN&amount=100&side=buy&spread=0.04
 */
export function convert(req: Request, res: Response): void {
  const pair = String(req.query.pair ?? 'USD/MXN').toUpperCase();
  const amount = Number(req.query.amount ?? 1);
  const side = (req.query.side as 'buy' | 'sell') ?? 'buy';
  const spreadOverride = req.query.spread !== undefined ? Number(req.query.spread) : undefined;

  const quote = marketData.getQuote(pair);
  if (!quote) throw new HttpError(404, `Par no soportado: ${pair}`);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, 'El monto debe ser un número positivo.');
  }

  let bid = quote.bid;
  let ask = quote.ask;
  if (spreadOverride !== undefined && spreadOverride >= 0) {
    bid = Number((quote.price - spreadOverride / 2).toFixed(6));
    ask = Number((quote.price + spreadOverride / 2).toFixed(6));
  }

  const rate = side === 'buy' ? ask : bid;
  res.json({
    data: {
      pair,
      side,
      amount,
      rate,
      mid: quote.price,
      bid,
      ask,
      spread: Number((ask - bid).toFixed(6)),
      result: Number((amount * rate).toFixed(2)),
      updatedAt: quote.updatedAt,
    },
  });
}
