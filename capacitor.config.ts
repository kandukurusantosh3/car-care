import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.carcare.app',
  appName: 'Car Care',
  webDir: 'build',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
