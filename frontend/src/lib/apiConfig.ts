import { Capacitor } from '@capacitor/core';

const PRODUCTION_API = 'https://broker-mx-api.onrender.com';

function isUsableApiUrl(url: string | undefined): url is string {
  if (!url?.trim()) return false;
  if (url.includes('TU_IP_LOCAL')) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** URL del servidor API (sin /api al final). Vacío en web con proxy de Vite. */
export function getServerUrl(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (isUsableApiUrl(configured)) return configured.replace(/\/$/, '');
  // App nativa sin URL válida → producción (celular real no alcanza 10.0.2.2).
  if (Capacitor.isNativePlatform()) return PRODUCTION_API;
  return '';
}

export function getApiBase(): string {
  const server = getServerUrl();
  return server ? `${server}/api` : '/api';
}

export function getWsPricesUrl(): string {
  const server = getServerUrl();
  if (server) return server.replace(/^http/, 'ws') + '/ws/prices';
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/ws/prices`;
}

export function getUploadsBase(): string {
  const server = getServerUrl();
  return server || '';
}

export function resolveUploadUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const server = getServerUrl();
  return server ? `${server}${path}` : path;
}
