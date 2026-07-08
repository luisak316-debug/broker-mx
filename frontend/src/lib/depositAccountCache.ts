import type { DepositAccountInfo } from '../types';

const PREFIX = 'brokermx:deposit-account:';

export function readDepositAccountCache(clientId: string): DepositAccountInfo | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${clientId}`);
    return raw ? (JSON.parse(raw) as DepositAccountInfo) : null;
  } catch {
    return null;
  }
}

export function writeDepositAccountCache(clientId: string, info: DepositAccountInfo): void {
  try {
    sessionStorage.setItem(`${PREFIX}${clientId}`, JSON.stringify(info));
  } catch {
    /* quota / modo privado */
  }
}

export async function prefetchDepositAccount(
  clientId: string,
  fetcher: (id: string) => Promise<DepositAccountInfo>,
): Promise<DepositAccountInfo> {
  const data = await fetcher(clientId);
  writeDepositAccountCache(clientId, data);
  return data;
}
