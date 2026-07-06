/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary, #FF8A1F)',
          dark: 'var(--primary-dark, #E56F00)',
          light: 'var(--primary-light, #FFB86B)',
          soft: 'var(--primary-soft, #FFE6CC)',
          extraLight: 'var(--primary-soft, #FFE6CC)',
        },
        accent: {
          DEFAULT: '#00CEC9',
          dark: '#00B5B0',
        },
        cardDark: {
          DEFAULT: '#1A1613',
          light: '#2B241F',
        },
        dark: '#151515',
        darker: '#090909',
        secondary: '#1E1A17',
        background: 'var(--background, #F8F2EB)',
        backgroundSecondary: 'var(--background-secondary, #F1E7DD)',
        gray50: 'var(--card-color, #FFFCF8)',
        gray100: 'var(--card-color, #FFFCF8)',
        gray200: '#F5ECE2',
        gray300: '#E7D8C8',
        gray400: '#D0C0B0',
        gray500: '#A89584',
        gray600: '#7A6859',
        gray700: '#4F433A',
        gray800: '#2B2622',
        success: '#00C896',
        successLight: '#55EFC4',
        warning: '#FFB547',
        warningDark: '#E17055',
        danger: '#FF6B6B',
        dangerLight: '#FAB1C7',
        info: '#4DA3FF',
        infoLight: '#74B9FF',
        clayPink: '#FFE1D1',
        clayBlue: '#FFF0E1',
        clayPeach: '#FFD4AD',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '28px',
        '5xl': '32px',
      },
      boxShadow: {
        clay: '14px 14px 26px rgba(31, 155, 122, 0.36), -10px -10px 26px rgba(204, 255, 255, 0.8)',
        'clay-sm': '8px 8px 18px rgba(31, 155, 122, 0.25), -6px -6px 18px rgba(255, 255, 255, 0.9)',
        'clay-inset': 'inset 8px 8px 16px rgba(168, 149, 132, 0.1), inset -6px -6px 16px rgba(255, 255, 255, 0.75)',
        'clay-nav': '0 8px 32px rgba(31, 155, 122, 0.15), 0 -2px 8px rgba(255, 255, 255, 0.8)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'fade-slide': 'fadeSlide 0.35s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        shimmer: 'shimmer 1.2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeSlide: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [],
}
