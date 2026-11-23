/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc', // Slate 50
        surface: '#ffffff',
        border: '#e2e8f0', // Slate 200
        muted: '#64748b', // Slate 500
        navy: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        clinical: {
          blue: '#0284c7', // Sky 600
          darkblue: '#0369a1', // Sky 700
          teal: '#0d9488', // Teal 600
          lightteal: '#f0fdfa', // Teal 50
        },
        status: {
          normal: {
            text: '#15803d',
            bg: '#dcfce7',
            border: '#86efac',
            dot: '#16a34a',
          },
          warning: {
            text: '#b45309',
            bg: '#fef3c7',
            border: '#fde68a',
            dot: '#d97706',
          },
          abnormal: {
            text: '#b91c1c',
            bg: '#fee2e2',
            border: '#fca5a5',
            dot: '#dc2626',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.04)',
      },
    },
  },
  plugins: [],
}
