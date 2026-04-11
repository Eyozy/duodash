import dns from 'node:dns';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

dns.setDefaultResultOrder('verbatim');
const DEFAULT_DEV_HOST = 'localhost';
const DEFAULT_DEV_PORT = 4321;

function getDevServerConfig(env = process.env) {
  const host = env.DEV_HOST || DEFAULT_DEV_HOST;
  const port = Number(env.PORT || DEFAULT_DEV_PORT);

  return {
    host,
    port,
    strictPort: false,
  };
}

const devServerConfig = getDevServerConfig();

export default defineConfig({
  site: 'https://duodash.vercel.app',
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  devToolbar: {
    enabled: false
  },
  server: {
    host: devServerConfig.host,
    port: devServerConfig.port,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.duolingo.com https://*.openai.com https://vitals.vercel-insights.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  },
  integrations: [
    react()
  ],
  vite: {
    server: devServerConfig,
    build: {
      cssCodeSplit: true,
      minify: 'esbuild',
      cssMinify: 'esbuild'
    },
    ssr: {
      noExternal: ['recharts']
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'recharts'],
      exclude: ['@zumer/snapdom']
    }
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  }
});
