import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          DEFAULT: '#E8701A',
          dark: '#C45E14',
          light: '#F0854A',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-jost)', 'system-ui', 'sans-serif'],
        display: ['var(--font-rethink)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        elevated: '0 4px 24px -4px rgba(0,0,0,0.10)',
        brand: '0 4px 24px -4px rgba(232,112,26,0.35)',
        card: '2px 4px 10px -2px rgba(0,0,0,0.09), 0 1px 2px 0 rgba(0,0,0,0.04)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #E8701A 0%, #C45E14 100%)',
      },
    },
  },
  plugins: [animate],
}

export default config
