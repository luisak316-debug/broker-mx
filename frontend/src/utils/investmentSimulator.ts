/** Proyección compuesta mensual a partir de rendimiento anual histórico promedio. */
export function projectInvestment(
  principalMxn: number,
  annualReturnPct: number,
  months: number,
) {
  const monthlyRate = (1 + annualReturnPct / 100) ** (1 / 12) - 1;
  const totalMxn = principalMxn * (1 + monthlyRate) ** months;
  const profitMxn = totalMxn - principalMxn;
  const returnPct = (profitMxn / principalMxn) * 100;

  return {
    totalMxn,
    profitMxn,
    returnPct,
    monthlyRatePct: monthlyRate * 100,
  };
}
