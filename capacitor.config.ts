import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ttsbareng.app',
  appName: 'TTS Bareng',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
  },
  plugins: {},
};

export default config;
