import type { Request, Response } from 'express';
import { COMMODITIES } from '../data/instruments';
import { marketData } from '../services/marketData.service';

/**
 * Alertas de alta volatilidad para materias primas.
 * Marca como "alerta" los instrumentos cuya variación porcentual absoluta
 * supera el umbral recibido (por defecto 1.5%).
 */
export function volatilityAlerts(req: Request, res: Response): void {
  const threshold = Number(req.query.threshold ?? 1.5);
  const alerts = COMMODITIES.map((inst) => {
    const quote = marketData.getQuote(inst.symbol)!;
    const severity =
      Math.abs(quote.changePct) >= threshold * 2
        ? 'alta'
        : Math.abs(quote.changePct) >= threshold
          ? 'media'
          : 'normal';
    return {
      symbol: inst.symbol,
      name: inst.name,
      group: inst.meta?.group,
      changePct: quote.changePct,
      price: quote.price,
      severity,
      triggered: severity !== 'normal',
    };
  });
  res.json({
    data: alerts,
    meta: { threshold, triggeredCount: alerts.filter((a) => a.triggered).length },
  });
}
