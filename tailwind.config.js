/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#e53935', // Main brand color
          600: '#d32f2f',
          700: '#c62828',
          800: '#b71c1c',
          900: '#8f0000',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        emergency: {
          50: '#fff3e0',
          500: '#ff9800',
          600: '#f57c00',
          700: '#ef6c00',
        },
        success: {
          50: '#e8f5e8',
          500: '#4caf50',
          600: '#43a047',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'pulse-emergency': 'pulse-emergency 2s infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-emergency': {
          '0%, 100%': {
            transform: 'scale(1)',
            'box-shadow': '0 0 0 0 rgba(255, 152, 0, 0.7)'
          },
          '50%': {
            transform: 'scale(1.05)',
            'box-shadow': '0 0 0 10px rgba(255, 152, 0, 0)'
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
};
