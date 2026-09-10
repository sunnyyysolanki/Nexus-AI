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
          bg: '#09090b',         // zinc-950
          surface: '#18181b',    // zinc-900
          card: '#18181b',       // zinc-900
          border: '#27272a',     // zinc-800
          hover: '#27272a',      // zinc-800
        },
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#cbd5e1',        // slate-300 for neutral primary
          600: '#94a3b8',        // slate-400
          700: '#64748b',        // slate-500
          cyan: '#38bdf8',       // subtle accent if needed
        },
        severity: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#3b82f6',
          info: '#71717a'
        },
        status: {
          open: '#ef4444',
          investigating: '#f59e0b',
          resolved: '#10b981'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
