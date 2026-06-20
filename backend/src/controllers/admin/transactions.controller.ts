import type { Request, Response } from 'express';
import { transactions, findClient } from '../../data/adminStore';
import type { AssetClass } from '../../types/market';

/** Historial detallado de movimientos en las 4 categorías, con filtros. */
export function listTransactions(req: Request, res: Response): void {
  const userId = req.query.userId as string | undefined;
  const category = req.query.category as AssetClass | undefined;

  let items = transactions;
  if (userId) items = items.filter((t) => t.userId === userId);
  if (category) items = items.filter((t) => t.category === category);

  const enriched = items
    .map((t) => ({ ...t, clientName: findClient(t.userId)?.displayName }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 200);

  res.json({ data: enriched, meta: { total: enriched.length } });
}
