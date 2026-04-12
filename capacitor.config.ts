import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yandexgo.clone',
  appName: 'Yandex Go Clone',
  webDir: 'dist',
  bundledWebRuntime: false,

  server: {
    androidScheme: 'https'
  }
};

export default config;
