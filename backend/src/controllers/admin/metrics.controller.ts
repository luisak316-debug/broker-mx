import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { transactions } from '../../data/adminStore';

export async function dashboardMetrics(_req: Request, res: Response): Promise<void> {
  const users = await prisma.user.findMany({ include: { balance: true } });
  const totalClients = users.length;
  const totalCash = round2(users.reduce((a, u) => a + Number(u.balance?.cashMxn ?? 0), 0));
  const totalInvested = round2(users.reduce((a, u) => a + Number(u.totalInvestedMxn), 0));
  const pendingRequests = await prisma.cashRequest.count({ where: { status: 'PENDIENTE' } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const approvedDeposits = await prisma.cashRequest.findMany({
    where: {
      type: 'DEPOSITO',
      status: 'APROBADA',
      reviewedAt: { gte: today },
    },
  });
  const depositsToday = round2(
    approvedDeposits.reduce((a, r) => a + Number(r.amountMxn), 0),
  );

  const staffRows = await prisma.staff.findMany({
    where: { OR: [{ role: 'ADVISOR' }, { role: 'ADMIN' }] },
  });

  const advisors = staffRows.map((s) => {
    const cartera = users.filter((u) => u.advisorId === s.id);
    return {
      advisorId: s.id,
      name: s.displayName,
      clients: cartera.length,
      aumMxn: round2(
        cartera.reduce(
          (a, c) => a + Number(c.balance?.cashMxn ?? 0) + Number(c.totalInvestedMxn),
          0,
        ),
      ),
    };
  });

  const byCategory = ['stock', 'commodity', 'forex', 'crypto'].map((cat) => ({
    category: cat,
    volumeMxn: round2(
      transactions.filter((t) => t.category === cat).reduce((a, t) => a + t.amountMxn, 0),
    ),
    count: transactions.filter((t) => t.category === cat).length,
  }));

  res.json({
    data: {
      totalClients,
      totalCash,
      totalInvested,
      pendingRequests,
      depositsToday,
      advisors,
      byCategory,
    },
  });
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
