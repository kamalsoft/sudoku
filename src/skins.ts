import type { StringKey } from './i18n';
import type { ThemeName } from './theme';

// The skins, grouped into categories for the Skins screen. Each skin is a palette in theme.ts.
export type SkinCategory = 'classic' | 'dark' | 'kids';

export const SKIN_CATEGORIES: { id: SkinCategory; title: StringKey; skins: ThemeName[] }[] = [
  { id: 'classic', title: 'cat_classic', skins: ['light', 'sepia'] },
  { id: 'dark', title: 'cat_dark', skins: ['dark', 'oled'] },
  { id: 'kids', title: 'cat_kids', skins: ['candy', 'sunshine', 'ocean', 'jungle', 'space', 'rainbow'] },
];

export const SKIN_KEYS: Record<ThemeName, StringKey> = {
  light: 'theme_light',
  sepia: 'theme_sepia',
  dark: 'theme_dark',
  oled: 'theme_oled',
  candy: 'theme_candy',
  sunshine: 'theme_sunshine',
  ocean: 'theme_ocean',
  jungle: 'theme_jungle',
  space: 'theme_space',
  rainbow: 'theme_rainbow',
};
