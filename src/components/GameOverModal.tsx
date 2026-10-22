import React, { useState } from 'react';
import { GameMode, ScenarioType } from '../types/game';
import { Trophy, RotateCcw, Home, Skull } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  wave: number;
  mode: GameMode;
  scenario: ScenarioType;
  onRestart: () => void;
  onQuitToMenu: () => void;
  onSaveScore: (playerName: string) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  wave,
  onRestart,
  onQuitToMenu,
  onSaveScore,
}) => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saved) return;
    onSaveScore(name.trim());
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-lg p-6 bg-slate-900 border border-red-500/30 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center flex flex-col items-center">
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-full mb-3 text-red-500">
          <Skull className="w-10 h-10 animate-bounce" />
        </div>

        <h2 className="text-4xl font-black text-red-500 tracking-wider mb-1">
          NAVE DESTRUIDA
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Tu estructura cayó bajo el fuego enemigo.
        </p>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 w-full bg-slate-950/70 p-4 rounded-xl border border-slate-800 mb-6">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">PUNTUACIÓN FINAL</div>
            <div className="text-3xl font-extrabold text-amber-400">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">OLEADA ALCANZADA</div>
            <div className="text-3xl font-extrabold text-cyan-400">{wave}</div>
          </div>
        </div>

        {/* Highscore Submission */}
        {!saved ? (
          <form onSubmit={handleSave} className="w-full mb-6 flex flex-col gap-2">
            <label className="text-xs text-slate-300 font-semibold text-left">
              Registra tu puntuación en la tabla local:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={12}
                placeholder="Nombre del Piloto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm flex items-center gap-1 transition-all"
              >
                <Trophy className="w-4 h-4" /> Guardar
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full mb-6 p-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 rounded-lg text-sm font-semibold">
            ¡Récord guardado correctamente!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg"
          >
            <RotateCcw className="w-5 h-5" /> Reintentar
          </button>

          <button
            onClick={onQuitToMenu}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all"
          >
            <Home className="w-5 h-5" /> Menú
          </button>
        </div>
      </div>
    </div>
  );
};
