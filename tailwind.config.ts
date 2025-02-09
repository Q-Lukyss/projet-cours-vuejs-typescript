/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    colors:{
      "darkblue": "#1F1A38",
      "violet": "#7B506F",
      "lightviolet": "#DD99BB",
      "beige": "#DBCDC6",
      "lightbeige": "#EAD7D1",
    },
    extend: {},
  },
  plugins: [],
}

