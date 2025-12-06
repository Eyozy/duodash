import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import { loadEnv } from 'vite';

// 加载环境变量
const { DUOLINGO_USERNAME, DUOLINGO_JWT, AI_PROVIDER, GEMINI_API_KEY, OPENROUTER_API_KEY, DEEPSEEK_API_KEY, SILICONFLOW_API_KEY, MOONSHOT_API_KEY, CUSTOM_API_KEY, AI_MODEL, AI_BASE_URL } = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [
    react(),
    tailwind()
  ],
  vite: {
    define: {
      // Duolingo 配置
      'import.meta.env.DUOLINGO_USERNAME': JSON.stringify(DUOLINGO_USERNAME || ''),
      'import.meta.env.DUOLINGO_JWT': JSON.stringify(DUOLINGO_JWT || ''),
      // AI 配置
      'import.meta.env.AI_PROVIDER': JSON.stringify(AI_PROVIDER || 'gemini'),
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(GEMINI_API_KEY || ''),
      'import.meta.env.OPENROUTER_API_KEY': JSON.stringify(OPENROUTER_API_KEY || ''),
      'import.meta.env.DEEPSEEK_API_KEY': JSON.stringify(DEEPSEEK_API_KEY || ''),
      'import.meta.env.SILICONFLOW_API_KEY': JSON.stringify(SILICONFLOW_API_KEY || ''),
      'import.meta.env.MOONSHOT_API_KEY': JSON.stringify(MOONSHOT_API_KEY || ''),
      'import.meta.env.CUSTOM_API_KEY': JSON.stringify(CUSTOM_API_KEY || ''),
      'import.meta.env.AI_MODEL': JSON.stringify(AI_MODEL || 'gemini-2.5-flash'),
      'import.meta.env.AI_BASE_URL': JSON.stringify(AI_BASE_URL || ''),
    }
  }
});
