import { AIMode, UITheme } from './types';

export const NORMAL = {
  void: '#07111f',
  deep: '#0c1c33',
  panel: '#12263f',
  card: '#17304d',
  line: '#2a4a72',
  accent: '#3aa0ff',
  accentSoft: '#7ec4ff',
  glow: 'rgba(58,160,255,0.45)',
  text: '#e8f1fb',
  muted: '#8aa4c2',
  user: '#1b3a5c',
  ai: '#10263d',
  danger: '#ff6b6b',
  ok: '#3ddeb0',
};

export const DARK = {
  void: '#050308',
  deep: '#0b0612',
  panel: '#14081c',
  card: '#1c0c26',
  line: '#3d1a55',
  accent: '#c026ff',
  accentSoft: '#e879ff',
  glow: 'rgba(192,38,255,0.5)',
  text: '#f4e9ff',
  muted: '#b08cc8',
  user: '#2a1038',
  ai: '#160818',
  danger: '#ff2d55',
  ok: '#ff4d6d',
};

export const LIGHT = {
  void: '#eef3f9',
  deep: '#f7fafc',
  panel: '#ffffff',
  card: '#ffffff',
  line: '#c9d6e6',
  accent: '#1565c0',
  accentSoft: '#1e88e5',
  glow: 'rgba(21,101,192,0.2)',
  text: '#102033',
  muted: '#5b7089',
  user: '#dceaf8',
  ai: '#f0f4f8',
  danger: '#c62828',
  ok: '#00897b',
};

export type Palette = typeof NORMAL;

export function getPalette(mode: AIMode, ui: UITheme): Palette {
  if (ui === 'light') {
    if (mode === 'dark') {
      return {
        ...LIGHT,
        accent: '#7b1fa2',
        accentSoft: '#9c27b0',
        glow: 'rgba(123,31,162,0.22)',
        user: '#f3e5f5',
        ai: '#faf5fc',
        danger: '#c2185b',
      };
    }
    return LIGHT;
  }
  return mode === 'dark' ? DARK : NORMAL;
}

export const fonts = {
  display: 'Orbitron_700Bold',
  displayMed: 'Orbitron_500Medium',
  mono: 'ShareTechMono_400Regular',
};
