import React from 'react';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onQuitToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center flex flex-col items-center">
        <h2 className="text-3xl font-extrabold tracking-wider text-cyan-400 mb-2">
          JUEGO EN PAUSA
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Tómate un respiro antes de volver a la batalla espacial.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg"
          >
            <Play className="w-5 h-5 fill-current" /> Continuar Misión
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all"
          >
            <RotateCcw className="w-5 h-5" /> Reiniciar Misión
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all"
          >
            <Settings className="w-5 h-5" /> Ajustes
          </button>

          <button
            type="button"
            onClick={onQuitToMenu}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 font-semibold transition-all mt-2"
          >
            <Home className="w-5 h-5" /> Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
};
