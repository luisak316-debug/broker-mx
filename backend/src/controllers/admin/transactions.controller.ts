import type { Request, Response } from 'express';
import { findClient } from '../../repositories/client.repository';
import { transactions } from '../../data/adminStore';
import type { AssetClass } from '../../types/market';

export async function listTransactions(req: Request, res: Response): Promise<void> {
  const userId = req.query.userId as string | undefined;
  const category = req.query.category as AssetClass | undefined;

  let items = transactions;
  if (userId) items = items.filter((t) => t.userId === userId);
  if (category) items = items.filter((t) => t.category === category);

  const enriched = await Promise.all(
    items.map(async (t) => ({
      ...t,
      clientName: (await findClient(t.userId))?.displayName,
    })),
  );

  const sorted = enriched.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 200);

  res.json({ data: sorted, meta: { total: sorted.length } });
}
