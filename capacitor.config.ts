import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yandexgo.clone',
  appName: 'Yandex Go Clone',
  webDir: 'dist',
  server: {
    url: 'http://192.168.56.1:3000', // This will be updated dynamically
    cleartext: true
  },
  plugins: {
    LiveReload: {
      enabled: true,
      url: 'http://192.168.56.1:3000'
    }
  }
};

export default config;
