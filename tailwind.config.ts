import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAF6EE',
        surface: '#FFFFFF',
        ink: '#24291F',
        muted: '#767C6C',
        primary: { DEFAULT: '#1F4A3D', light: '#2E6B57', dark: '#153229' },
        gold: { DEFAULT: '#C89B3C', light: '#E8CE8E' },
        border: '#E7DFC9',
        danger: { DEFAULT: '#B0472B', bg: '#FBEBE4' },
        income: { DEFAULT: '#2E6B57', bg: '#E9F1EB' },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}
export default config
