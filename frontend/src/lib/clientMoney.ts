import { useMemo } from 'react';
import { useClientAuth } from '../auth/ClientAuthContext';
import { getLatamCountry } from '../data/latamCountries';
import { fmtCurrency } from './format';

/** Moneda y formateo según el país del cliente en sesión. */
export function useClientMoney(portfolioCurrency?: string) {
  const { client } = useClientAuth();
  const countryCode = client?.countryCode ?? 'MX';
  const currency = portfolioCurrency ?? client?.currency ?? getLatamCountry(countryCode).currency;

  return useMemo(
    () => ({
      countryCode,
      currency,
      format: (amount: number) => fmtCurrency(amount, currency, countryCode),
    }),
    [countryCode, currency],
  );
}
