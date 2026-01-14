import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8e949255418c439eadf707937b6dc022',
  appName: 'inphrone',
  webDir: 'dist',
  server: {
    url: 'https://8e949255-418c-439e-adf7-07937b6dc022.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0f',
      showSpinner: true,
      spinnerColor: '#dc2626'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0a0a0f'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
