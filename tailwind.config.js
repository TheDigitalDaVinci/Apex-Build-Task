/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#FFFFFF',
          sidebar: '#F7F6F3',
          card: '#FFFFFF',
          border: '#E8E7E4',
          hover: '#EFEFEF',
          text: '#37352F',
          muted: '#787774',
          accent: '#EA580C', // Construction safety orange
          amber: '#F59E0B',
          yellow: '#FEF08A',
        }
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Helvetica',
          '"Apple Color Emoji"',
          'Arial',
          'sans-serif',
        ],
      }
    },
  },
  plugins: [],
};
