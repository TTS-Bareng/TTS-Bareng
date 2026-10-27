import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.syntheticae.ttsbareng',
  appName: 'TTS Bareng',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  ios: {
    preferredContentMode: 'mobile',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    GoogleSignIn: {
      clientId: '260911640333-mues538f6c5csidqdfcigda2pstavhd9.apps.googleusercontent.com',
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#111113',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
