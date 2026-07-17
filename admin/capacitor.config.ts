import type { CapacitorConfig } from '@capacitor/cli';

/**
 * App Android Admin.
 * Package ID Play Store: com.brokermx.asesores
 */
const config: CapacitorConfig = {
  appId: 'com.brokermx.asesores',
  appName: 'INVERMAX LATAM Admin',
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
