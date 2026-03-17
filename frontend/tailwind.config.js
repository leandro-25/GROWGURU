module.exports = {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}', // Inclui todos os arquivos Vue, JS, TS, JSX, TSX na pasta src
    './public/index.html', // Inclui o arquivo HTML principal
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
    },
  },
  plugins: [],
};
