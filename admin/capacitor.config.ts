import type { CapacitorConfig } from '@capacitor/cli';

/**
 * App Android para ASESORES / administradores (backoffice).
 * Package ID Play Store: com.brokermx.asesores
 */
const config: CapacitorConfig = {
  appId: 'com.brokermx.asesores',
  appName: 'Broker MX Asesores',
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
