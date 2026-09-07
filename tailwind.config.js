/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand)',
        'brand-strong': 'var(--brand-strong)',
        'brand-ink': 'var(--brand-ink)',
        ink: '#101828',
        muted: '#5B6472',
        line: '#E4E7EC',
        surface: '#FFFFFF',
        canvas: '#F5F7FA',
        danger: '#B42318',
        success: '#067647',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
