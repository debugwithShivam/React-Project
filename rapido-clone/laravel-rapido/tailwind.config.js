/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F9C933',
          'yellow-hover': '#E5B724',
          'yellow-light': '#FEF9C3',
          dark: '#111827',
          charcoal: '#1F2937',
          gray: '#4B5563',
          light: '#F9FAFB'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'yellow-glow': '0 0 25px rgba(249, 201, 51, 0.35)',
      }
    },
  },
  plugins: [],
}
