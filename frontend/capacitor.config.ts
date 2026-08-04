import type { CapacitorConfig } from '@capacitor/cli';

/**
 * App Android para CLIENTES (inversionistas).
 * Package ID Play Store: com.invermaxlatam.cliente
 */
const config: CapacitorConfig = {
  appId: 'com.invermaxlatam.cliente',
  appName: 'INVERMAX LATAM',
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
