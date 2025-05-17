/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom colors for dark mode
        dark: {
          bg: {
            primary: '#121212',
            secondary: '#1e1e1e',
            tertiary: '#2d2d2d',
          },
          text: {
            primary: '#f3f4f6',
            secondary: '#d1d5db',
            tertiary: '#9ca3af',
          },
          border: {
            primary: '#3f3f46',
            secondary: '#52525b',
          },
          accent: {
            blue: '#3b82f6',
            green: '#10b981',
            red: '#ef4444',
          },
        },
      },
    },
  },
  plugins: [],
};