import { usePrefs } from './prefs';

export type ThemeName = 'light' | 'dark' | 'oled' | 'sepia';

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
  // Cell highlight tints, in the spec's priority order: selected, error, same number, peer.
  tone: { selected: string; error: string; same: string; peer: string };
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
    tone: {
      selected: 'rgba(139, 94, 52, 0.35)',
      error: 'rgba(185, 28, 28, 0.25)',
      same: 'rgba(139, 94, 52, 0.2)',
      peer: 'rgba(120, 100, 70, 0.12)',
    },
  },
};

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];

export function useColors(): Palette {
  return THEMES[usePrefs((s) => s.theme)];
}
