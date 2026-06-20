import { Capacitor } from '@capacitor/core';

export function getServerUrl(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured?.trim()) return configured.replace(/\/$/, '');
  if (Capacitor.isNativePlatform()) return 'http://10.0.2.2:4000';
  return '';
}

export function getApiBase(): string {
  const server = getServerUrl();
  return server ? `${server}/api/admin` : '/api/admin';
}

export function resolveUploadUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const server = getServerUrl();
  return server ? `${server}${path}` : path;
}
