import React from 'react';
import { HighScore } from '../types/game.ts';
import { Trophy, X, ShieldAlert } from 'lucide-react';

interface HighScoresModalProps {
  highScores: HighScore[];
  onClose: () => void;
}

export const HighScoresModal: React.FC<HighScoresModalProps> = ({ highScores, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative text-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6" /> Tabla de Récords Locales
        </h2>

        {highScores.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <ShieldAlert className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No hay récords registrados todavía.</p>
            <p className="text-xs text-slate-600 mt-1">¡Juega una partida para registrar tu nombre!</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {highScores.map((score, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      index === 0
                        ? 'bg-amber-400 text-slate-950'
                        : index === 1
                        ? 'bg-slate-300 text-slate-950'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm">{score.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase">
                      {score.mode.toUpperCase()} • {score.scenario}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-extrabold text-amber-400">
                    {score.score.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">{score.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
