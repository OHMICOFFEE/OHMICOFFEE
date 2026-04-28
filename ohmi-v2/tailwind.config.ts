import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0F1419', light: '#1a2332', border: '#1e2d3d' },
        cream: { DEFAULT: '#F5EDD6', muted: '#c9b99a' },
        crimson: { DEFAULT: '#C41E4A', dark: '#9e1039', glow: 'rgba(196,30,74,0.15)' },
        ink: { DEFAULT: '#050505' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"','Georgia','serif'],
        mono: ['"IBM Plex Mono"','monospace'],
        sans: ['"DM Sans"','sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
