export type GameMode = 'menu' | '2d' | '3d';

export type ScenarioType = 'alien' | 'asteroids' | 'station' | 'nebula' | 'warzone';

export interface ScenarioInfo {
  id: ScenarioType;
  name: string;
  description: string;
  colorHex: string;
  skyColor: string;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  missiles: number;
  maxMissiles: number;
  laserCooldown: number; // in seconds or ratio
  missileCooldown: number;
  score: number;
  wave: number;
  boostEnergy: number;
  maxBoostEnergy: number;
  isBoosting: boolean;
}

export interface Settings {
  soundEnabled: boolean;
  sfxVolume: number; // 0 to 1
  musicVolume: number; // 0 to 1
  invertedY: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
  mode: GameMode;
  scenario: ScenarioType;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface WeaponStatus {
  canFireLaser: boolean;
  laserCooldownRatio: number; // 0 (ready) to 1 (cooling down)
  canFireMissile: boolean;
  missileCooldownRatio: number;
  hasTargetLock: boolean;
  targetId: string | null;
}
