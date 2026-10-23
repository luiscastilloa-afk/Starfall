import React from 'react';
import { GameMode, ScenarioType } from '../types/game.ts';
import { Play, Shield, Globe, Orbit, ShieldAlert, Cloud, Flame, Trophy, Settings, Crosshair } from 'lucide-react';

interface MainMenuProps {
  onStartGame: (mode: GameMode, scenario: ScenarioType) => void;
  onOpenSettings: () => void;
  onOpenHighScores: () => void;
  selectedScenario: ScenarioType;
  setSelectedScenario: (scenario: ScenarioType) => void;
}

const SCENARIOS: Array<{
  id: ScenarioType;
  name: string;
  description: string;
  icon: React.ReactNode;
  bgGradient: string;
}> = [
  {
    id: 'alien',
    name: 'Planeta Alienígena',
    description: 'Atraviesa la órbita tóxica y las defensas pesadas de Xylar Prime.',
    icon: <Globe className="w-6 h-6 text-emerald-400" />,
    bgGradient: 'from-emerald-900/40 to-teal-950/80',
  },
  {
    id: 'asteroids',
    name: 'Campo de Asteroides',
    description: 'Navega un denso cinturón de asteroides con colisiones mortales.',
    icon: <Orbit className="w-6 h-6 text-amber-400" />,
    bgGradient: 'from-amber-900/40 to-stone-950/80',
  },
  {
    id: 'station',
    name: 'Estación Hostil',
    description: 'Infiltra el sector Alpha de una megadestructura militar enemiga.',
    icon: <ShieldAlert className="w-6 h-6 text-red-400" />,
    bgGradient: 'from-red-900/40 to-slate-950/80',
  },
  {
    id: 'nebula',
    name: 'Nebulosa Oscura',
    description: 'Combate electromagnético en una tormenta de polvo cósmico.',
    icon: <Cloud className="w-6 h-6 text-purple-400" />,
    bgGradient: 'from-purple-900/40 to-indigo-950/80',
  },
  {
    id: 'warzone',
    name: 'Zona de Guerra',
    description: 'Enfrentamiento total contra la flota nodriza armada.',
    icon: <Flame className="w-6 h-6 text-orange-400" />,
    bgGradient: 'from-orange-900/40 to-neutral-950/80',
  },
];

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenSettings,
  onOpenHighScores,
  selectedScenario,
  setSelectedScenario,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-slate-950 text-white overflow-y-auto selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Background Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Header Title */}
      <header className="z-10 text-center my-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3 backdrop-blur-md">
          <Crosshair className="w-4 h-4 animate-spin-slow" /> COMBATE ESPACIAL FUTURISTA
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
          STARFALL
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto font-light">
          Pilota la nave estelar de combate. Elimina oleadas enemigas, destruye jefes temibles y domina el cosmos.
        </p>
      </header>

      {/* Scenario Selection */}
      <section className="z-10 w-full max-w-5xl my-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest text-center mb-4">
          Selecciona el Escenario de Misión
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                type="button"
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`relative flex flex-col p-4 rounded-xl text-left border transition-all duration-200 backdrop-blur-md bg-gradient-to-b ${
                  sc.bgGradient
                } ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_20px_rgba(56,189,248,0.3)] scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  {sc.icon}
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                  )}
                </div>
                <h3 className="font-bold text-base text-slate-100 mb-1">{sc.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{sc.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Mode Selection Buttons */}
      <section className="z-10 w-full max-w-2xl flex flex-col sm:flex-row gap-4 my-6">
        <button
          type="button"
          onClick={() => onStartGame('2d', selectedScenario)}
          className="flex-1 group relative flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg shadow-[0_0_25px_rgba(14,165,233,0.4)] border border-cyan-400/40 transition-all hover:scale-105 active:scale-95"
        >
          <Play className="w-6 h-6 fill-current" />
          <div className="text-left">
            <div>MODO ARCADE 2D</div>
            <div className="text-xs font-normal text-cyan-200">Vista superior & Vuelo fluido</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onStartGame('3d', selectedScenario)}
          className="flex-1 group relative flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg shadow-[0_0_25px_rgba(168,85,247,0.4)] border border-purple-400/40 transition-all hover:scale-105 active:scale-95"
        >
          <Shield className="w-6 h-6" />
          <div className="text-left">
            <div>MODO SIMULADOR 3D</div>
            <div className="text-xs font-normal text-purple-200">1ª Persona & Realismo Visual</div>
          </div>
        </button>
      </section>

      {/* Footer / Utility Action Buttons */}
      <footer className="z-10 flex items-center gap-4 mb-2">
        <button
          type="button"
          onClick={onOpenHighScores}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-sm backdrop-blur-md"
        >
          <Trophy className="w-4 h-4 text-amber-400" /> Récords
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-sm backdrop-blur-md"
        >
          <Settings className="w-4 h-4 text-cyan-400" /> Ajustes
        </button>
      </footer>
    </div>
  );
};
