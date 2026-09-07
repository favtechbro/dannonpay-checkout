/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-strong': 'var(--accent-strong)',
        'accent-ink': 'var(--accent-ink)',
        'accent-soft': 'var(--accent-soft)',
        navy: '#0A1628',
        'navy-deep': '#102E4E',
        'navy-ink': '#031C40',
        blue: '#005EE6',
        ice: '#E6F3FE',
        ink: '#212121',
        body: '#616161',
        muted: '#9E9E9E',
        line: '#E5E9EE',
        'line-soft': '#EEF1F4',
        surface: '#FFFFFF',
        canvas: '#F6F8FA',
        success: '#07834B',
        warning: '#F57C00',
        danger: '#B71C1C',
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 24px 48px -24px rgba(10, 22, 40, 0.28)',
        float: '0 12px 32px -12px rgba(10, 22, 40, 0.24)',
        ring: '0 0 0 4px var(--accent-soft)',
      },
      borderRadius: {
        card: '20px',
        control: '12px',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        draw: {
          to: { strokeDashoffset: '0' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '70%': { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        draw: 'draw 520ms cubic-bezier(0.65, 0, 0.35, 1) 160ms forwards',
        pop: 'pop 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        shimmer: 'shimmer 1.6s linear infinite',
        breathe: 'breathe 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
