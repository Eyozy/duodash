import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';
import netlify from '@astrojs/netlify';

// 根据环境变量自动选择适配器
// Vercel: VERCEL 环境变量存在
// Netlify: NETLIFY 环境变量存在
// 其他: 使用 Node 适配器
function getAdapter() {
  if (process.env.VERCEL) {
    return vercel();
  } else if (process.env.NETLIFY) {
    return netlify();
  } else {
    return node({ mode: 'standalone' });
  }
}

export default defineConfig({
  output: 'server',
  adapter: getAdapter(),
  integrations: [
    react(),
    tailwind()
  ],
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'esbuild',
      cssMinify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'recharts': ['recharts'],
            'react-vendor': ['react', 'react-dom']
          }
        }
      }
    },
    ssr: {
      noExternal: ['recharts']
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'recharts']
    }
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  }
});
