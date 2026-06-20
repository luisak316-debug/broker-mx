import type { CapacitorConfig } from '@capacitor/cli';

/**
 * App Android para CLIENTES (inversionistas).
 * Package ID Play Store: com.brokermx.cliente
 */
const config: CapacitorConfig = {
  appId: 'com.brokermx.cliente',
  appName: 'Broker.mx',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
