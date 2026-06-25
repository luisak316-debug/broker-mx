import type { Request, Response } from 'express';
import { getDailyMarketNews } from '../services/marketNews.service';

export async function getMarketNews(_req: Request, res: Response): Promise<void> {
  const items = await getDailyMarketNews();
  res.json({
    data: {
      updatedAt: new Date().toISOString(),
      dateKey: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }),
      items,
    },
  });
}
