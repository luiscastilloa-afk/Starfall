import { useState, useEffect } from 'react';
import { GameMode, ScenarioType, PlayerStats, WeaponStatus, Settings, HighScore } from './types/game.ts';
import { loadSettings, saveSettings, loadHighScores, saveHighScore } from './utils/storage.ts';
import { MainMenu } from './components/MainMenu.tsx';
import { HUD } from './components/HUD.tsx';
import { PauseMenu } from './components/PauseMenu.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { HighScoresModal } from './components/HighScoresModal.tsx';
import { Game2DCanvas } from './components/Game2DCanvas.tsx';
import { Game3DCanvas } from './components/Game3DCanvas.tsx';

export default function App() {
  const [mode, setMode] = useState<GameMode>('menu');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('alien');
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);

  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [highScores, setHighScores] = useState<HighScore[]>(loadHighScores());

  // Live game stats passed from the Canvas engine to HUD
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    shield: 100,
    maxShield: 100,
    missiles: 10,
    maxMissiles: 10,
    laserCooldown: 0,
    missileCooldown: 0,
    score: 0,
    wave: 1,
    boostEnergy: 100,
    maxBoostEnergy: 100,
    isBoosting: false,
  });

  const [weaponStatus, setWeaponStatus] = useState<WeaponStatus>({
    canFireLaser: true,
    laserCooldownRatio: 0,
    canFireMissile: true,
    missileCooldownRatio: 0,
    hasTargetLock: false,
    targetId: null,
  });

  const [radarBlips, setRadarBlips] = useState<Array<{ x: number; y: number; isEnemy: boolean; isBoss?: boolean }>>([]);

  const handleUpdateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleStartGame = (startMode: GameMode, scenario: ScenarioType) => {
    setSelectedScenario(scenario);
    setMode(startMode);
    setIsPaused(false);
    setIsGameOver(false);
    setPlayerStats({
      health: 100,
      maxHealth: 100,
      shield: 100,
      maxShield: 100,
      missiles: 10,
      maxMissiles: 10,
      laserCooldown: 0,
      missileCooldown: 0,
      score: 0,
      wave: 1,
      boostEnergy: 100,
      maxBoostEnergy: 100,
      isBoosting: false,
    });
  };

  const handleRestart = () => {
    setIsGameOver(false);
    setIsPaused(false);
    // Re-triggering mode resets the canvas component
    const currentMode = mode;
    setMode('menu');
    setTimeout(() => {
      setMode(currentMode);
    }, 50);
  };

  const handleQuitToMenu = () => {
    setIsPaused(false);
    setIsGameOver(false);
    setMode('menu');
  };

  const handleSaveScore = (name: string) => {
    const newEntry: HighScore = {
      name,
      score: playerStats.score,
      date: new Date().toLocaleDateString(),
      mode,
      scenario: selectedScenario,
    };
    saveHighScore(newEntry);
    setHighScores(loadHighScores());
  };

  // Keyboard shortcut listener for pausing with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && mode !== 'menu' && !isGameOver) {
        setIsPaused((prev) => !prev);
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [mode, isGameOver]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Menu Mode */}
      {mode === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHighScores={() => setShowHighScores(true)}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
        />
      )}

      {/* 2D Mode */}
      {mode === '2d' && (
        <Game2DCanvas
          scenario={selectedScenario}
          settings={settings}
          isPaused={isPaused}
          onUpdateStats={setPlayerStats}
          onUpdateWeapon={setWeaponStatus}
          onUpdateRadar={setRadarBlips}
          onGameOver={() => setIsGameOver(true)}
        />
      )}

      {/* 3D Mode */}
      {mode === '3d' && (
        <Game3DCanvas
          scenario={selectedScenario}
          settings={settings}
          isPaused={isPaused}
          onUpdateStats={setPlayerStats}
          onUpdateWeapon={setWeaponStatus}
          onUpdateRadar={setRadarBlips}
          onGameOver={() => setIsGameOver(true)}
        />
      )}

      {/* In-Game HUD */}
      {mode !== 'menu' && (
        <HUD
          stats={playerStats}
          weapon={weaponStatus}
          mode={mode}
          onPause={() => setIsPaused(true)}
          radarBlips={radarBlips}
        />
      )}

      {/* Pause Menu Modal */}
      {isPaused && (
        <PauseMenu
          onResume={() => setIsPaused(false)}
          onRestart={handleRestart}
          onOpenSettings={() => setShowSettings(true)}
          onQuitToMenu={handleQuitToMenu}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          score={playerStats.score}
          wave={playerStats.wave}
          mode={mode}
          scenario={selectedScenario}
          onRestart={handleRestart}
          onQuitToMenu={handleQuitToMenu}
          onSaveScore={handleSaveScore}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* High Scores Modal */}
      {showHighScores && (
        <HighScoresModal
          highScores={highScores}
          onClose={() => setShowHighScores(false)}
        />
      )}
    </div>
  );
}
