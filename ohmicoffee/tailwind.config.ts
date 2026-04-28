import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#050505',
        'black-2': '#0c0c0c',
        'black-3': '#141414',
        'black-4': '#1c1c1c',
        red: { DEFAULT: '#C41E4A', dark: '#9e1039' },
        cream: '#F5EDD6',
      },
      fontFamily: {
        cond: ['"Barlow Condensed"','sans-serif'],
        sans: ['Barlow','sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
