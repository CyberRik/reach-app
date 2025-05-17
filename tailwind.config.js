import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
        './node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
      ],
  theme: {
    extend: {
    },
  },
  plugins: [
        require('flowbite/plugin')
      ],
};