import React from 'react';
import { PlayerStats, WeaponStatus, GameMode } from '../types/game';
import { Shield, Heart, Zap, Target, Crosshair } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  weapon: WeaponStatus;
  mode: GameMode;
  onPause: () => void;
  radarBlips?: Array<{ x: number; y: number; isEnemy: boolean; isBoss?: boolean }>;
}

export const HUD: React.FC<HUDProps> = ({ stats, weapon, mode, onPause, radarBlips = [] }) => {
  const healthPercent = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (stats.shield / stats.maxShield) * 100));
  const boostPercent = Math.max(0, Math.min(100, (stats.boostEnergy / stats.maxBoostEnergy) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 z-20 font-mono text-white">
      {/* Top Bar: Vitals & Score/Wave */}
      <div className="flex items-start justify-between w-full">
        {/* Shield and Hull status */}
        <div className="flex flex-col gap-2 bg-slate-950/70 border border-slate-800 backdrop-blur-md p-3 rounded-lg min-w-[240px] pointer-events-auto">
          {/* Shield Bar */}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden border border-cyan-500/30">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full transition-all duration-150"
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
            <span className="text-xs text-cyan-300 w-12 text-right">
              {Math.ceil(stats.shield)}/{stats.maxShield}
            </span>
          </div>

          {/* Health Bar */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden border border-emerald-500/30">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-150"
                style={{ width: `${healthPercent}%` }}
              />
            </div>
            <span className="text-xs text-emerald-300 w-12 text-right">
              {Math.ceil(stats.health)}/{stats.maxHealth}
            </span>
          </div>

          {/* Boost Energy Bar */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-amber-500/30">
              <div
                className={`h-full transition-all duration-100 ${
                  stats.isBoosting ? 'bg-amber-400 animate-pulse' : 'bg-amber-500'
                }`}
                style={{ width: `${boostPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-300 uppercase tracking-wide">
              {stats.isBoosting ? 'IMPULSO' : 'TURBO'}
            </span>
          </div>
        </div>

        {/* Center Wave and Score Display */}
        <div className="text-center bg-slate-950/70 border border-slate-800 backdrop-blur-md px-6 py-2 rounded-lg">
          <div className="text-xs text-cyan-400 tracking-widest uppercase">
            OLEADA <span className="text-lg font-bold text-cyan-300">{stats.wave}</span>
          </div>
          <div className="text-2xl font-black text-amber-400 tracking-wider">
            {stats.score.toLocaleString()} <span className="text-xs font-normal text-slate-400">PTS</span>
          </div>
        </div>

        {/* Top Right: Controls / Pause */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onPause}
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-sm font-sans tracking-wide transition-all shadow-lg"
          >
            PAUSA (Esc)
          </button>
        </div>
      </div>

      {/* Center Reticle overlay for 3D Mode */}
      {mode === '3d' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center">
          <div
            className={`w-16 h-16 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
              weapon.hasTargetLock
                ? 'border-red-500 scale-110 animate-pulse bg-red-500/10'
                : 'border-cyan-400/60'
            }`}
          >
            <Crosshair
              className={`w-8 h-8 ${weapon.hasTargetLock ? 'text-red-500' : 'text-cyan-400/80'}`}
            />
          </div>
          {weapon.hasTargetLock && (
            <div className="mt-2 text-xs font-bold text-red-500 bg-black/70 px-2 py-0.5 rounded border border-red-500/50 uppercase tracking-widest animate-bounce">
              OBJETIVO FIJADO (F)
            </div>
          )}
        </div>
      )}

      {/* Bottom Bar: Weapon Status & Radar */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom Left: Laser & Missile Ammo Status */}
        <div className="bg-slate-950/70 border border-slate-800 backdrop-blur-md p-3 rounded-lg flex items-center gap-4 pointer-events-auto">
          {/* Laser Status */}
          <div className="flex flex-col items-center">
            <div className="text-[10px] text-slate-400 uppercase">LÁSER (ESPACIO)</div>
            <div
              className={`w-12 h-12 rounded-lg border flex items-center justify-center font-bold text-xs mt-1 ${
                weapon.laserCooldownRatio === 0
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'border-slate-700 text-slate-500 bg-slate-900/50'
              }`}
            >
              {weapon.laserCooldownRatio === 0 ? 'LISTO' : `${Math.ceil(weapon.laserCooldownRatio * 100)}%`}
            </div>
          </div>

          {/* Missile Status */}
          <div className="flex flex-col items-center">
            <div className="text-[10px] text-slate-400 uppercase">MISILES (F)</div>
            <div
              className={`w-16 h-12 rounded-lg border flex flex-col items-center justify-center font-bold text-xs mt-1 ${
                stats.missiles > 0 && weapon.missileCooldownRatio === 0
                  ? 'border-amber-400 text-amber-300 bg-amber-950/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                  : 'border-slate-700 text-slate-500 bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-amber-400" />
                <span>{stats.missiles} / {stats.maxMissiles}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Right: Radar display */}
        <div className="bg-slate-950/80 border border-slate-800 backdrop-blur-md p-2 rounded-xl flex flex-col items-center">
          <div className="text-[10px] text-cyan-400 font-sans tracking-widest uppercase mb-1">
            RADAR CERCANO
          </div>
          <div className="relative w-28 h-28 rounded-full border border-cyan-500/40 bg-slate-950/90 overflow-hidden flex items-center justify-center">
            {/* Grid circles */}
            <div className="absolute w-20 h-20 rounded-full border border-cyan-500/20 pointer-events-none" />
            <div className="absolute w-10 h-10 rounded-full border border-cyan-500/20 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:14px_14px]" />

            {/* Player Center Icon */}
            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#38bdf8] z-10" />

            {/* Radar Blips */}
            {radarBlips.map((blip, idx) => {
              // Clamp radar positions inside circle (-1 to +1 range)
              const clampedX = Math.max(-1, Math.min(1, blip.x));
              const clampedY = Math.max(-1, Math.min(1, blip.y));
              const px = 56 + clampedX * 46;
              const py = 56 + clampedY * 46;

              return (
                <div
                  key={idx}
                  style={{ left: `${px}px`, top: `${py}px` }}
                  className={`absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    blip.isBoss
                      ? 'w-3.5 h-3.5 bg-purple-500 border border-purple-200 animate-ping'
                      : blip.isEnemy
                      ? 'bg-red-500 shadow-[0_0_5px_#ef4444]'
                      : 'bg-emerald-400'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
