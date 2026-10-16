/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          bg: '#0B0F17',
          card: '#161F30',
          hover: '#1c283f',
          border: '#24324D',
          borderSubtle: '#1f2b42',
        },
        brand: {
          emerald: '#10B981',
          emeraldLight: '#34D399',
          emeraldDark: '#059669',
          emeraldBg: 'rgba(16, 185, 129, 0.10)',
        },
        alert: {
          coral: '#F43F5E',
          coralLight: '#FB7185',
          coralBg: 'rgba(244, 63, 94, 0.10)',
        },
        muted: {
          slate: '#94A3B8',
          subtle: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
