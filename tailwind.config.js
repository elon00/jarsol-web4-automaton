/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#030708',
          panel: '#081215',
          border: '#0d252a',
          cyan: '#00f0ff',
          green: '#00ff66',
          purple: '#b026ff',
          gold: '#ffd700',
          red: '#ff0055',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'Courier New', 'Consolas', 'monospace'],
        cyber: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.4), inset 0 0 5px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.8), inset 0 0 10px rgba(0, 240, 255, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
