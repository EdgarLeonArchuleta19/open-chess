import type { AppPreferences } from '../features/chess/types/chess.types';

const PREFERENCES_STORAGE_KEY = 'openchess:preferences:v1';
const EASTER_EGG_UNLOCKED_KEY = 'openchess:rochin-unlocked:v1';

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'dark',
  boardPalette: 'minimal',
  soundEnabled: true,
  showCoordinates: true,
  autoFlipLocal: false,
};

export function loadPreferences(): AppPreferences {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<AppPreferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: AppPreferences): void {
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota or private mode errors
  }
}

export function loadEasterEggUnlocked(): boolean {
  try {
    return window.localStorage.getItem(EASTER_EGG_UNLOCKED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveEasterEggUnlocked(unlocked: boolean): void {
  try {
    window.localStorage.setItem(EASTER_EGG_UNLOCKED_KEY, String(unlocked));
  } catch {
    // Ignore storage errors
  }
}
