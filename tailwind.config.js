/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0084ff',
          hover: '#0073e6',
          light: '#e6f2ff',
        },
        secondary: '#6772e5',
        success: '#05cd99',
        warning: '#ffb100',
        danger: '#e53e3e',
        dark: {
          100: '#1a202c',
          200: '#2d3748',
          300: '#4a5568',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
