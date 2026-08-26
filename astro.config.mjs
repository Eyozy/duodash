import dns from 'node:dns';
import { defineConfig, sessionDrivers } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import vercel from '@astrojs/vercel';
import netlify from '@astrojs/netlify';
import { loadEnv } from 'vite';

dns.setDefaultResultOrder('verbatim');
const DEFAULT_DEV_HOST = 'localhost';
const DEFAULT_DEV_PORT = 4321;

const loadedEnv = loadEnv(process.env.NODE_ENV === 'production' ? 'production' : 'development', process.cwd(), '');
for (const [key, value] of Object.entries(loadedEnv)) {
  if (process.env[key] === undefined) process.env[key] = value;
}

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

function getAdapter(env = process.env) {
  if (env.DEPLOY_TARGET === 'cloudflare') {
    return cloudflare({ imageService: 'passthrough' });
  }

  if (env.NETLIFY) {
    return netlify();
  }

  return vercel({
    webAnalytics: {
      enabled: false
    }
  });
}

function getSessionConfig(env = process.env) {
  if (env.DEPLOY_TARGET === 'cloudflare') {
    // The app does not use Astro sessions. Keep the adapter from requiring a
    // Cloudflare KV namespace while retaining a valid runtime driver.
    return {
      driver: sessionDrivers.memory()
    };
  }

  return undefined;
}

export default defineConfig({
  output: 'server',
  adapter: getAdapter(),
  session: getSessionConfig(),
  devToolbar: {
    enabled: false
  },
  server: {
    host: devServerConfig.host,
    port: devServerConfig.port,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.duolingo.com https://*.openai.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
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
