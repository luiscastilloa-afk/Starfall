import React from 'react';
import { Settings } from '../types/game.ts';
import { Volume2, VolumeX, Shield, X } from 'lucide-react';

interface SettingsModalProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative text-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6" /> Ajustes del Juego
        </h2>

        <div className="space-y-6">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
              <span>Sonido Global</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* SFX Volume */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-300">
              <span>Volumen de Efectos</span>
              <span className="text-cyan-400">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => onUpdateSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Dificultad */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium">Dificultad de IA</label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'normal', 'hard'] as const).map((diff) => {
                const labels = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil' };
                return (
                  <button
                    type="button"
                    key={diff}
                    onClick={() => onUpdateSettings({ ...settings, difficulty: diff })}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      settings.difficulty === diff
                        ? 'bg-cyan-600 text-white border border-cyan-400'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {labels[diff]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Invertir Eje Y en 3D */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-sm text-slate-300 font-medium">Invertir Eje Y (Modo 3D)</span>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, invertedY: !settings.invertedY })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.invertedY ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.invertedY ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all"
        >
          Guardar y Cerrar
        </button>
      </div>
    </div>
  );
};
