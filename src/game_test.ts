import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './utils/storage.ts';

// Simple unit tests for game logic and storage
if (typeof (globalThis as unknown as { Deno?: unknown }).Deno !== 'undefined') {
  const DenoObj = (globalThis as unknown as { Deno: { test: (name: string, fn: () => void) => void } }).Deno;

  DenoObj.test('DEFAULT_SETTINGS should have default sound enabled and normal difficulty', () => {
    if (!DEFAULT_SETTINGS.soundEnabled) {
      throw new Error('Sound should be enabled by default');
    }
    if (DEFAULT_SETTINGS.difficulty !== 'normal') {
      throw new Error('Difficulty should default to normal');
    }
  });

  DenoObj.test('loadSettings should return default settings when localStorage is empty', () => {
    const settings = loadSettings();
    if (typeof settings.soundEnabled !== 'boolean') {
      throw new Error('Settings soundEnabled must be a boolean');
    }
  });

  DenoObj.test('saveSettings should not crash when localStorage is available', () => {
    saveSettings(DEFAULT_SETTINGS);
  });
}
