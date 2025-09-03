/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de colores principal - sincronizado con dashboard Electron
        theme: {
          background: 'var(--color-background)',
          surface: 'var(--color-surface)',
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          accent: 'var(--color-accent)',
          text: 'var(--color-text)',
          'text-secondary': 'var(--color-textSecondary)',
          'text-muted': 'var(--color-textMuted)',
          'text-inverse': 'var(--color-textInverse)',
          border: 'var(--color-border)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          error: 'var(--color-error)',
        },
        // Colores específicos para sidebar
        sidebar: {
          background: 'var(--color-sidebar-background)',
          surface: 'var(--color-sidebar-surface)',
          border: 'var(--color-sidebar-border)',
          text: 'var(--color-sidebar-text)',
          'text-secondary': 'var(--color-sidebar-textSecondary)',
          hover: 'var(--color-sidebar-hover)',
          active: 'var(--color-sidebar-active)',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}