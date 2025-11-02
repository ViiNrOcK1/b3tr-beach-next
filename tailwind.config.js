/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#0C84C4',
        'amber-400': '#fbbf24',
        'green-500': '#22c55e'
      }
    }
  },
  plugins: []
};