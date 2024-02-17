/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    screens: {
      'small-mobile': '376px',
      'medium-mobile': '400px',
      mobile: '600px',
      'small-tablet': '768px',
      tablet: '900px',
      'small-desktop': '1040px',
      'medium-desktop': '1300px',
      'large-desktop': '1600px',
    },
    extend: {
      fontFamily: {
        primary: ['Open Sans', 'sans-serif'],
        primaryB: ['Nunito Sans', 'sans-serif'],
        'gilroy-regular': ['Gilroy Refular', 'sans-serif'],
        'gilroy-medium': ['Gilroy Medium', 'sans-serif'],
        'gilroy-semibold': ['Gilroy Semibold', 'sans-serif'],
        'gilroy-bold': ['Gilroy Bold', 'sans-serif'],
        'gilroy-extrabold': ['Gilroy Extrabold', 'sans-serif'],
      }, color: {
        'border-grey': 'rgba(135, 135, 135, 0.53)'
      }
    },
  },
  plugins: [],
}
