import type { Request, Response } from 'express';
import { cashRequests, clients, staff, transactions } from '../../data/adminStore';

/** Métricas para el dashboard del backoffice. */
export function dashboardMetrics(_req: Request, res: Response): void {
  const totalClients = clients.length;
  const totalCash = round2(clients.reduce((a, c) => a + c.cashMxn, 0));
  const totalInvested = round2(clients.reduce((a, c) => a + c.totalInvestedMxn, 0));
  const pendingRequests = cashRequests.filter((r) => r.status === 'PENDIENTE').length;

  const today = new Date().toISOString().slice(0, 10);
  const depositsToday = round2(
    cashRequests
      .filter((r) => r.type === 'DEPOSITO' && r.status === 'APROBADA' && r.reviewedAt?.startsWith(today))
      .reduce((a, r) => a + r.amountMxn, 0),
  );

  // Rendimiento por asesor: nº de clientes y activos bajo gestión (AUM).
  const advisors = staff
    .filter((s) => s.role === 'ADVISOR' || s.role === 'ADMIN')
    .map((s) => {
      const cartera = clients.filter((c) => c.advisorId === s.id);
      return {
        advisorId: s.id,
        name: s.displayName,
        clients: cartera.length,
        aumMxn: round2(cartera.reduce((a, c) => a + c.cashMxn + c.totalInvestedMxn, 0)),
      };
    });

  // Volumen operado por categoría (4 mercados).
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
