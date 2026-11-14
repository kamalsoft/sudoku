import { usePrefs } from './prefs';

export type ThemeName = 'light' | 'dark' | 'oled' | 'sepia' | 'candy' | 'jungle' | 'space';

export interface Palette {
  background: string;
  surface: string;
  text: string;
  given: string;
  entry: string;
  error: string;
  line: string;
  lineStrong: string;
  muted: string;
  accent: string;
  onAccent: string;
  statusBar: 'light' | 'dark';
  // Corner radius for keys and buttons. Kid themes are rounder.
  radius: number;
  // Cell highlight tints, in the spec's priority order: selected, error, same number, peer.
  tone: { selected: string; error: string; same: string; peer: string };
  // Flash for a wrong entry, and the glow when a row, column or block is completed.
  flash: string;
  success: string;
}

export const THEMES: Record<ThemeName, Palette> = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    given: '#0F172A',
    entry: '#2563EB',
    error: '#EF4444',
    line: '#CBD5E1',
    lineStrong: '#334155',
    muted: '#64748B',
    accent: '#2563EB',
    onAccent: '#FFFFFF',
    statusBar: 'dark',
    radius: 8,
    flash: 'rgba(239, 68, 68, 0.55)',
    success: 'rgba(34, 197, 94, 0.45)',
    tone: {
      selected: 'rgba(59, 130, 246, 0.35)',
      error: 'rgba(239, 68, 68, 0.3)',
      same: 'rgba(59, 130, 246, 0.2)',
      peer: 'rgba(148, 163, 184, 0.12)',
    },
  },
  dark: {
    background: '#0B1220',
    surface: '#111A2E',
    text: '#E2E8F0',
    given: '#F8FAFC',
    entry: '#60A5FA',
    error: '#F87171',
    line: '#334155',
    lineStrong: '#64748B',
    muted: '#94A3B8',
    accent: '#3B82F6',
    onAccent: '#FFFFFF',
    statusBar: 'light',
    radius: 8,
    flash: 'rgba(248, 113, 113, 0.6)',
    success: 'rgba(74, 222, 128, 0.4)',
    tone: {
      selected: 'rgba(59, 130, 246, 0.45)',
      error: 'rgba(248, 113, 113, 0.35)',
      same: 'rgba(59, 130, 246, 0.25)',
      peer: 'rgba(148, 163, 184, 0.15)',
    },
  },
  oled: {
    background: '#000000',
    surface: '#000000',
    text: '#E5E5E5',
    given: '#FFFFFF',
    entry: '#60A5FA',
    error: '#F87171',
    line: '#262626',
    lineStrong: '#525252',
    muted: '#A3A3A3',
    accent: '#3B82F6',
    onAccent: '#FFFFFF',
    statusBar: 'light',
    radius: 8,
    flash: 'rgba(248, 113, 113, 0.6)',
    success: 'rgba(74, 222, 128, 0.4)',
    tone: {
      selected: 'rgba(59, 130, 246, 0.45)',
      error: 'rgba(248, 113, 113, 0.35)',
      same: 'rgba(59, 130, 246, 0.25)',
      peer: 'rgba(148, 163, 184, 0.14)',
    },
  },
  sepia: {
    background: '#F4ECD8',
    surface: '#FBF6EA',
    text: '#3B2F1E',
    given: '#2B1F0F',
    entry: '#1E40AF',
    error: '#B91C1C',
    line: '#D6C7A6',
    lineStrong: '#5C4A2E',
    muted: '#7A6A50',
    accent: '#8B5E34',
    onAccent: '#FFF8EC',
    statusBar: 'dark',
    radius: 8,
    flash: 'rgba(185, 28, 28, 0.5)',
    success: 'rgba(101, 163, 13, 0.4)',
    tone: {
      selected: 'rgba(139, 94, 52, 0.35)',
      error: 'rgba(185, 28, 28, 0.25)',
      same: 'rgba(139, 94, 52, 0.2)',
      peer: 'rgba(120, 100, 70, 0.12)',
    },
  },
  candy: {
    background: '#FFF0F7',
    surface: '#FFFFFF',
    text: '#4A154B',
    given: '#4A154B',
    entry: '#DB2777',
    error: '#E11D48',
    line: '#F9C5DC',
    lineStrong: '#B5478A',
    muted: '#9B5F8F',
    accent: '#A855F7',
    onAccent: '#FFFFFF',
    statusBar: 'dark',
    radius: 18,
    flash: 'rgba(225, 29, 72, 0.55)',
    success: 'rgba(34, 197, 94, 0.5)',
    tone: {
      selected: 'rgba(168, 85, 247, 0.35)',
      error: 'rgba(225, 29, 72, 0.25)',
      same: 'rgba(251, 191, 36, 0.4)',
      peer: 'rgba(244, 114, 182, 0.14)',
    },
  },
  jungle: {
    background: '#ECFDF3',
    surface: '#FFFFFF',
    text: '#14532D',
    given: '#14532D',
    entry: '#EA580C',
    error: '#DC2626',
    line: '#BBF7D0',
    lineStrong: '#166534',
    muted: '#4D7C5A',
    accent: '#16A34A',
    onAccent: '#FFFFFF',
    statusBar: 'dark',
    radius: 14,
    flash: 'rgba(220, 38, 38, 0.55)',
    success: 'rgba(250, 204, 21, 0.6)',
    tone: {
      selected: 'rgba(22, 163, 74, 0.35)',
      error: 'rgba(220, 38, 38, 0.25)',
      same: 'rgba(250, 204, 21, 0.4)',
      peer: 'rgba(134, 239, 172, 0.2)',
    },
  },
  space: {
    background: '#1E1B4B',
    surface: '#2E2A6B',
    text: '#EEF2FF',
    given: '#FFFFFF',
    entry: '#FDE047',
    error: '#FB7185',
    line: '#4338CA',
    lineStrong: '#A5B4FC',
    muted: '#C7D2FE',
    accent: '#22D3EE',
    onAccent: '#0F172A',
    statusBar: 'light',
    radius: 14,
    flash: 'rgba(251, 113, 133, 0.6)',
    success: 'rgba(74, 222, 128, 0.5)',
    tone: {
      selected: 'rgba(34, 211, 238, 0.4)',
      error: 'rgba(251, 113, 133, 0.35)',
      same: 'rgba(253, 224, 71, 0.3)',
      peer: 'rgba(129, 140, 248, 0.2)',
    },
  },
};

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];

export function useColors(): Palette {
  return THEMES[usePrefs((s) => s.theme)];
}
