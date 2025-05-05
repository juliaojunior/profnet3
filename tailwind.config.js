/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-dark': '#2563EB',
        background: '#111827',
        'background-light': '#1F2937',
        text: '#F9FAFB',
        'text-muted': '#9CA3AF',
      }
    },
  },
  plugins: [],
}
