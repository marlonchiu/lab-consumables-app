/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#952b2b',
          600: '#7f1d1d',
          700: '#6b1717',
          800: '#581c1c',
          900: '#4c1d1d'
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px'
      },
      boxShadow: {
        soft: '0 2px 8px rgba(149, 43, 43, 0.1)',
        medium: '0 4px 16px rgba(149, 43, 43, 0.15)',
        strong: '0 8px 24px rgba(149, 43, 43, 0.2)'
      }
    }
  },
  corePlugins: {
    preflight: false
  }
}
