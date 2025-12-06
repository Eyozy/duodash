/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        duo: {
          green: '#58cc02',
          blue: '#1cb0f6',
          purple: '#ce82ff',
          orange: '#ff9600',
          red: '#ff4b4b',
          yellow: '#ffc800',
        }
      }
    },
  },
  plugins: [],
}
