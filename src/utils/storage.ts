import { HighScore, Settings } from '../types/game.ts';

const SETTINGS_KEY = 'starfall_settings';
const HIGHSCORES_KEY = 'starfall_highscores';

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.5,
  invertedY: false,
  difficulty: 'normal',
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadHighScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(HIGHSCORES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHighScore(score: HighScore): void {
  try {
    const scores = loadHighScores();
    scores.push(score);
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 10);
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(topScores));
  } catch (err) {
    console.error('Failed to save high score:', err);
  }
}
