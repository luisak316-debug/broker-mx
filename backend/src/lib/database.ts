/** True cuando la API debe usar PostgreSQL (Render o local con docker). */
export function isDatabaseEnabled(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(url && url.startsWith('postgres'));
}

/** Añade sslmode=require si Render lo necesita. */
export function normalizeDatabaseUrl(url: string): string {
  if (!url.startsWith('postgres')) return url;
  if (url.includes('sslmode=')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}sslmode=require`;
}

export function applyDatabaseEnv(): void {
  if (isDatabaseEnabled() && process.env.DATABASE_URL) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);
  }
}
