/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0b0f17',
          surface: '#131926',
          card: '#1a2234',
          border: '#2a354d',
          hover: '#242f45',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          cyan: '#06b6d4',
        },
        severity: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#3b82f6',
          info: '#64748b'
        },
        status: {
          open: '#f43f5e',
          investigating: '#f59e0b',
          resolved: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-rose': '0 0 15px -3px rgba(244, 63, 94, 0.4)',
        'glow-amber': '0 0 15px -3px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 15px -3px rgba(16, 185, 129, 0.4)',
        'glow-indigo': '0 0 15px -3px rgba(99, 102, 241, 0.4)',
      }
    },
  },
  plugins: [],
}
