/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        danger: 'var(--danger)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        background: {
          DEFAULT: 'var(--background)',
          dark: 'var(--background-dark)',
        },
        text: {
          main: 'var(--text-main)',
          secondary: 'var(--text-secondary)',
          light: 'var(--text-light)',
          inverted: 'var(--text-inverted)',
        },
        glass: {
          DEFAULT: 'var(--glass-bg)',
          strong: 'var(--glass-bg-strong)',
          hover: 'rgba(255, 255, 255, 0.45)',
        },
      },
      borderRadius: {
        'theme-sm': 'var(--rounded-sm)',
        'theme-md': 'var(--rounded-md)',
        'theme-lg': 'var(--rounded-lg)',
        'theme-xl': 'var(--rounded-xl)',
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
      },
      spacing: {
        'theme-xs': 'var(--space-xs)',
        'theme-sm': 'var(--space-sm)',
        'theme-md': 'var(--space-md)',
        'theme-lg': 'var(--space-lg)',
        'theme-xl': 'var(--space-xl)',
        'theme-xxl': 'var(--space-xxl)',
      },
      transitionDuration: {
        'theme-fast': 'var(--transition-fast)',
        'theme-mid': 'var(--transition-mid)',
        'theme-slow': 'var(--transition-slow)',
      },
    },
  },
  plugins: [],
}
