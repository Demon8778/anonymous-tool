import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// Custom gradient colors for GIF generator
  			gradient: {
  				primary: {
  					from: 'hsl(var(--gradient-primary-from))',
  					to: 'hsl(var(--gradient-primary-to))'
  				},
  				secondary: {
  					from: 'hsl(var(--gradient-secondary-from))',
  					to: 'hsl(var(--gradient-secondary-to))'
  				},
  				accent: {
  					from: 'hsl(var(--gradient-accent-from))',
  					to: 'hsl(var(--gradient-accent-to))'
  				}
  			}
  		},
  		backgroundImage: {
  			// Custom gradient backgrounds
  			'gradient-primary': 'linear-gradient(135deg, hsl(var(--gradient-primary-from)), hsl(var(--gradient-primary-to)))',
  			'gradient-secondary': 'linear-gradient(135deg, hsl(var(--gradient-secondary-from)), hsl(var(--gradient-secondary-to)))',
  			'gradient-accent': 'linear-gradient(135deg, hsl(var(--gradient-accent-from)), hsl(var(--gradient-accent-to)))',
  			'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			// Hero section gradients
  			'hero-gradient': 'linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(213, 87%, 59%) 50%, hsl(170, 77%, 36%) 100%)',
  			'hero-gradient-dark': 'linear-gradient(135deg, hsl(262, 83%, 28%) 0%, hsl(213, 87%, 29%) 50%, hsl(170, 77%, 16%) 100%)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// Enhanced responsive breakpoints
  		screens: {
  			'xs': '475px',
  			'3xl': '1600px',
  		},
  		// Animation enhancements
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-up': 'slideUp 0.5s ease-out',
  			'slide-down': 'slideDown 0.5s ease-out',
  			'scale-in': 'scaleIn 0.3s ease-out',
  			'bounce-gentle': 'bounceGentle 2s infinite',
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			slideUp: {
  				'0%': { transform: 'translateY(20px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  			slideDown: {
  				'0%': { transform: 'translateY(-20px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  			scaleIn: {
  				'0%': { transform: 'scale(0.95)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  			bounceGentle: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-5px)' },
  			},
  		},
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
