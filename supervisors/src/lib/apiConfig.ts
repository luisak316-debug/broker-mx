const envUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

export function getApiBase(): string {
  if (envUrl) return `${envUrl}/api/supervisor`;
  return '/api/supervisor';
}

export function resolveUploadUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return envUrl ? `${envUrl}${path}` : path;
}
