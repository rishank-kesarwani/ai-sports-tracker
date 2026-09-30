/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#0f172a',
        'surface-card': '#141e33',
        'surface-border': '#1e293b',
        primary: {
          DEFAULT: '#00f2fe',
          hover: '#4facfe',
          glow: 'rgba(0, 242, 254, 0.25)',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          hover: '#a78bfa',
          glow: 'rgba(139, 92, 246, 0.25)',
        },
        sports: {
          live: '#ef4444',
          scheduled: '#3b82f6',
          finished: '#10b981',
          gold: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-cyan': '0 0 20px -2px rgba(0, 242, 254, 0.4)',
        'neon-purple': '0 0 20px -2px rgba(139, 92, 246, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
};
