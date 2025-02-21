import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      width: {
        '90': '360px',
        '108': '32rem',
        sidebar_open: '280px',
        sidebar_close: '100px',
        base_open: 'calc(100vw - 560px)',
        base_close: 'calc(100vw - 380px)',
        no_side_base_open: 'calc(100vw - 280px)',
        no_side_base_close: 'calc(100vw - 100px)',
        taskbar: '720px',
        taskbar_md: '90%',
        bottomBar: '100px',
      },
      height: {
        '90': '360px',
        '108': '32rem',
        navbar: '64px',
        base: 'calc(100vh - 64px)',
        taskbar: '48px',
        base_md: 'calc(100vh - 64px - 48px)',
      },
      minHeight: {
        base_md: 'calc(100vh - 64px - 48px)',
      },
      spacing: {
        navbar: '64px',
        base_padding: '24px',
        bottomBar: '100px',
        base_md: 'calc(100vh - 64px - 48px)',
      },
      boxShadow: {
        outer: '0 0 15px 2px #262626a1;',
        inner: '0px 0px 10px 1px #262626a1 inset;',
      },
      backgroundImage: {
        onboarding: 'url("/assets/onboarding.webp")',
        new_post: 'url("/assets/new_post.webp")',
      },
      colors: {
        primary_text: '#478EE1',
        dark_primary_gradient_start: '#633267',
        dark_primary_gradient_end: '#5b406b',
        dark_secondary_gradient_start: '#be76bf',
        dark_secondary_gradient_end: '#607ee7',
        primary_btn: '#9ca3af',
        dark_primary_btn: '#4B4A4A',
        primary_comp: '#478eeb18',
        dark_primary_comp: '#1c1c1c',
        primary_comp_hover: '#478eeb38',
        dark_primary_comp_hover: '#2e2e2e',
        primary_comp_active: '#478eeb86',
        dark_primary_comp_active: '#383838',
        primary_danger: '#ea333e',
        primary_black: '#2e2c2c',
        heart_filled: '#fe251baa',
        priority_high: '#fbbebe',
        priority_mid: '#fbf9be',
        priority_low: '#bffbbe',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      backgroundColor: {
        backdrop: '#0000003f',
        navbar: '#ffffff',
        dark_navbar: '#1b1b1b',
        main: '#e5e7eb',
        dark_main: '#252525',
        sidebar: '#ffffff',
        dark_sidebar: '#1b1b1b',
      },
      fontFamily: {
        primary: ['var(--inter-font)'],
        title: ['var(--fraunces-font)'],
        cursive: ['var(--great-vibes-font)'],
      },
      fontSize: {
        xxs: '0.5rem',
      },
      animation: {
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        fade_third: 'fade 0.3s ease-in-out',
        fade_third_delay: 'fade 0.3s ease-in-out 0.5s',
        fade_half: 'fade 0.5s ease-in-out',
        fade_1: 'fade 1s ease-in-out',
        fade_2: 'fade 2s ease-in-out',
        shrink: 'shrink 0.1s ease-in-out 0.4s forwards',
        reveal: 'reveal 0.3s ease-in-out',
        reveal_reverse: 'reveal_reverse 0.3s ease-in-out',
        onboarding_dummy_user_card: 'onboarding_dummy_user_card 3s ease-in-out 0.4s infinite',
        onboarding_dummy_user_card_backwards: 'onboarding_dummy_user_card_backwards 3s ease-in-out 0.4s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        marquee: 'marquee var(--duration) infinite linear',
        'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
        shine: 'shine var(--duration) infinite linear',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': {
            opacity: '1',
          },
          '20%,50%': {
            opacity: '0',
          },
        },
        shrink: {
          '0%': {
            scale: '100%',
          },
          '100%': {
            scale: '0%',
          },
        },
        fade: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        reveal: {
          '0%': {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0px)',
            opacity: '1',
          },
        },
        reveal_reverse: {
          '0%': {
            transform: 'translateY(0px)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(20px)',
            opacity: '0',
          },
        },
        onboarding_dummy_user_card: {
          '0%': {
            transform: 'translateX(316px)',
          },
          '100%': {
            transform: 'translateX(0px)',
          },
        },
        onboarding_dummy_user_card_backwards: {
          '0%': {
            transform: 'translateX(0px)',
          },
          '100%': {
            transform: 'translateX(316px)',
          },
        },
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        marquee: {
          from: {
            transform: 'translateX(0)',
          },
          to: {
            transform: 'translateX(calc(-100% - var(--gap)))',
          },
        },
        'marquee-vertical': {
          from: {
            transform: 'translateY(0)',
          },
          to: {
            transform: 'translateY(calc(-100% - var(--gap)))',
          },
        },
        shine: {
          '0%': {
            'background-position': '0% 0%',
          },
          '50%': {
            'background-position': '100% 100%',
          },
          to: {
            'background-position': '0% 0%',
          },
        },
        shimmer: {
          from: {
            backgroundPosition: '0 0',
          },
          to: {
            backgroundPosition: '-200% 0',
          },
        },
      },
      lineClamp: {
        '7': '7',
        '8': '8',
        '9': '9',
        '10': '10',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
    screens: {
      md: '768px',
      lg: '1080px',
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
