import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * "Magma" — the site's primary theme (approved in the design mockup).
 * Coral primary with warm-tinted surfaces: cream in light mode, deep plum in dark.
 *
 * Only semantic tokens are overridden; every PrimeNG component derives its
 * colors from these, so no per-component styling is needed. Future themes
 * (5 more slots, switchable from the dashboard) are additional presets built
 * the same way.
 */
export const MagmaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff3ef',
      100: '#ffe0d6',
      200: '#ffc3b0',
      300: '#ffa085',
      400: '#ff8763',
      500: '#ff6d4d',
      600: '#e0431f',
      700: '#b53013',
      800: '#8f2811',
      900: '#6e2010',
      950: '#3f1108',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.600}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.700}',
          activeColor: '{primary.800}',
        },
        surface: {
          0: '#fffdfb',
          50: '#fdf3ec',
          100: '#f7e8dd',
          200: '#e8d0bf',
          300: '#d3b6a2',
          400: '#a87f70',
          500: '#87645a',
          600: '#71504f',
          700: '#5f4149',
          800: '#462e36',
          900: '#31161f',
          950: '#200b13',
        },
      },
      dark: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#1c0f1a',
          hoverColor: '{primary.400}',
          activeColor: '{primary.300}',
        },
        // The 300–700 band carries muted text and borders on near-black
        // grounds — keep it light enough to stay readable (muted text ≥ 4.5:1,
        // borders clearly visible against surface.900 cards).
        surface: {
          0: '#ffffff',
          50: '#fdf0f3',
          100: '#f7dde4',
          200: '#e9c2cc',
          300: '#d4b3c1',
          400: '#bd94a7',
          500: '#a17b8f',
          600: '#6f4568',
          700: '#4f2d4a',
          800: '#301b2e',
          900: '#201021',
          950: '#150a16',
        },
      },
    },
  },
});
