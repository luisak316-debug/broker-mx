import { Capacitor } from '@capacitor/core';

/** URL del servidor API (sin /api al final). Vacío en web con proxy de Vite. */
export function getServerUrl(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured?.trim()) return configured.replace(/\/$/, '');
  // Emulador Android: 10.0.2.2 apunta al localhost de tu PC.
  if (Capacitor.isNativePlatform()) return 'http://10.0.2.2:4000';
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
