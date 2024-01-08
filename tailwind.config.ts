import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      width: {
        108: '32rem',
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
        108: '32rem',
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
        onboarding: "url('/assets/onboarding.webp')",
        new_post: "url('/assets/new_post.webp')",
      },
      colors: {
        primary_text: '#478EE1',
        dark_primary_gradient_start: '#633267',
        dark_primary_gradient_end: '#5b406b',
        dark_secondary_gradient_start: '#be76bf',
        dark_secondary_gradient_end: '#607ee7',
        primary_btn: '#9ca3af',
        dark_primary_btn: '#9275b9ba',
        primary_comp: '#478eeb18',
        dark_primary_comp: '#c578bf1b',
        primary_comp_hover: '#478eeb38',
        dark_primary_comp_hover: '#c578bf36',
        primary_comp_active: '#478eeb86',
        dark_primary_comp_active: '#c578bf5d',
        primary_danger: '#ea333e',
        primary_black: '#2e2c2c',
      },
      backgroundColor: {
        backdrop: '#0000003f',
        navbar: '#ffffff',
        dark_navbar: '#070615be',
        main: '#e5e7eb',
        dark_main: '#070615be',
        sidebar: '#ffffff',
        dark_sidebar: '#43434385',
      },
      fontFamily: {
        primary: ['var(--inter-font)'],
      },
      fontSize: {
        xxs: '0.5rem',
      },
      animation: {
        fade_third: 'fade 0.3s ease-in-out',
        fade_third_delay: 'fade 0.3s ease-in-out 0.5s',
        fade_half: 'fade 0.5s ease-in-out',
        fade_1: 'fade 1s ease-in-out',
        fade_2: 'fade 2s ease-in-out',
        shrink: 'shrink 0.1s ease-in-out 0.4s forwards',
        reveal: 'reveal 0.3s ease-in-out',
        reveal_reverse: 'reveal_reverse 0.3s ease-in-out',
      },
      keyframes: {
        shrink: {
          '0%': { scale: '100%' },
          '100%': { scale: '0%' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        reveal: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
        reveal_reverse: {
          '0%': { transform: 'translateY(0px)', opacity: '1' },
          '100%': { transform: 'translateY(20px)', opacity: '0' },
        },
      },
      lineClamp: {
        7: '7',
        8: '8',
        9: '9',
        10: '10',
      },
    },
    screens: {
      md: '768px',
      lg: '1080px',
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
export default config;
