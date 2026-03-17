import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'frontend',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'localhost',
    cleartext: true,
    allowNavigation: ['gg-railway-production.up.railway.app', '*.up.railway.app'],
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    App: {
      // Esquema de URL personalizado para deeplinks
      urlScheme: 'growguru',
      // Domínios associados ao app (opcional)
      domain: ['growguru.app', 'www.growguru.app'],
    },
  },
};

export default config;
