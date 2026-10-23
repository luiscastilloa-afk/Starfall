import React, { useEffect, useRef } from 'react';
import { ScenarioType, Settings, PlayerStats, WeaponStatus } from '../types/game.ts';
import { InputManager } from '../systems/input.ts';
import { audioSynth } from '../utils/audio.ts';

export interface Game2DProps {
  scenario: ScenarioType;
  settings: Settings;
  isPaused: boolean;
  onUpdateStats: (stats: PlayerStats) => void;
  onUpdateWeapon: (weapon: WeaponStatus) => void;
  onUpdateRadar: (blips: Array<{ x: number; y: number; isEnemy: boolean; isBoss?: boolean }>) => void;
  onGameOver: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Laser {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy: boolean;
  damage: number;
  color: string;
}

interface Missile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetId: string | null;
  life: number;
  damage: number;
}

interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  health: number;
  maxHealth: number;
  type: 'scout' | 'interceptor' | 'heavy' | 'boss';
  shootCooldown: number;
  color: string;
  radius: number;
  scoreValue: number;
}

interface Powerup {
  id: string;
  x: number;
  y: number;
  type: 'health' | 'shield' | 'missiles' | 'boost';
  radius: number;
}

interface Asteroid {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  vRot: number;
}

export const Game2DCanvas: React.FC<Game2DProps> = ({
  scenario,
  settings,
  isPaused,
  onUpdateStats,
  onUpdateWeapon,
  onUpdateRadar,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const input = new InputManager();
    input.attach();

    // Canvas sizing
    const resizeCanvas = () => {
      canvas.width = globalThis.innerWidth;
      canvas.height = globalThis.innerHeight;
    };
    resizeCanvas();
    globalThis.addEventListener('resize', resizeCanvas);

    // World size
    const worldWidth = canvas.width;
    const worldHeight = canvas.height;

    // Player State
    const player = {
      x: worldWidth / 2,
      y: worldHeight / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      speed: 0,
      maxSpeed: 6,
      boostSpeed: 10,
      rotationSpeed: 0.08,
      radius: 18,
      health: 100,
      maxHealth: 100,
      shield: 100,
      maxShield: 100,
      shieldRegenRate: 4, // per sec
      missiles: 10,
      maxMissiles: 10,
      boostEnergy: 100,
      maxBoostEnergy: 100,
      score: 0,
      wave: 1,
      laserCooldownTimer: 0,
      missileCooldownTimer: 0,
    };

    // Arrays of entities
    let lasers: Laser[] = [];
    let missiles: Missile[] = [];
    let enemies: Enemy[] = [];
    let particles: Particle[] = [];
    let powerups: Powerup[] = [];
    const asteroids: Asteroid[] = [];

    // Background Stars
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * worldWidth,
      y: Math.random() * worldHeight,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      alpha: Math.random() * 0.8 + 0.2,
    }));

    // Spawn wave function
    const spawnWave = (waveNum: number) => {
      enemies = [];

      // Determine enemy counts based on difficulty and wave
      const countFactor = settings.difficulty === 'hard' ? 1.5 : settings.difficulty === 'easy' ? 0.7 : 1.0;
      const scoutCount = Math.floor((3 + waveNum * 2) * countFactor);
      const interceptorCount = Math.floor((1 + waveNum) * countFactor);
      const heavyCount = waveNum > 2 ? Math.floor((waveNum - 1) * countFactor) : 0;
      const isBossWave = waveNum % 3 === 0;

      for (let i = 0; i < scoutCount; i++) {
        spawnEnemy('scout');
      }
      for (let i = 0; i < interceptorCount; i++) {
        spawnEnemy('interceptor');
      }
      for (let i = 0; i < heavyCount; i++) {
        spawnEnemy('heavy');
      }
      if (isBossWave) {
        spawnEnemy('boss');
      }

      // Spawn environmental asteroids if scenario is 'asteroids' or random
      if (scenario === 'asteroids' || Math.random() > 0.5) {
        const asteroidCount = scenario === 'asteroids' ? 12 : 5;
        for (let i = 0; i < asteroidCount; i++) {
          asteroids.push({
            id: Math.random().toString(),
            x: Math.random() * worldWidth,
            y: Math.random() * worldHeight,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 20 + Math.random() * 25,
            angle: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.04,
          });
        }
      }
    };

    const spawnEnemy = (type: Enemy['type']) => {
      // Spawn around edges
      let x = 0;
      let y = 0;
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -30 : worldWidth + 30;
        y = Math.random() * worldHeight;
      } else {
        x = Math.random() * worldWidth;
        y = Math.random() < 0.5 ? -30 : worldHeight + 30;
      }

      let health = 30;
      let radius = 16;
      let color = '#ef4444';
      let scoreValue = 100;

      if (type === 'interceptor') {
        health = 60;
        radius = 20;
        color = '#f97316';
        scoreValue = 200;
      } else if (type === 'heavy') {
        health = 120;
        radius = 26;
        color = '#a855f7';
        scoreValue = 400;
      } else if (type === 'boss') {
        health = 500 + player.wave * 100;
        radius = 45;
        color = '#ec4899';
        scoreValue = 1500;
      }

      enemies.push({
        id: Math.random().toString(),
        x,
        y,
        vx: 0,
        vy: 0,
        angle: Math.random() * Math.PI * 2,
        health,
        maxHealth: health,
        type,
        shootCooldown: Math.random() * 2,
        color,
        radius,
        scoreValue,
      });
    };

    const spawnExplosion = (x: number, y: number, color = '#f97316', count = 25) => {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0,
          maxLife: 20 + Math.random() * 20,
          color,
          size: Math.random() * 4 + 2,
        });
      }
    };

    spawnWave(player.wave);

    let lastTime = performance.now();

    // MAIN GAME LOOP
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isPaused) {
        const state = input.getState();

        // Check if player died
        if (player.health <= 0) {
          spawnExplosion(player.x, player.y, '#ef4444', 50);
          audioSynth.playExplosion(settings, true);
          onGameOver();
          return;
        }

        // --- Player Controls & Physics ---
        if (state.turnLeft) player.angle -= player.rotationSpeed;
        if (state.turnRight) player.angle += player.rotationSpeed;

        const isBoosting = state.boost && player.boostEnergy > 5;
        player.boostEnergy = isBoosting
          ? Math.max(0, player.boostEnergy - 30 * dt)
          : Math.min(player.maxBoostEnergy, player.boostEnergy + 15 * dt);

        const currentMaxSpeed = isBoosting ? player.boostSpeed : player.maxSpeed;
        let thrust = 0;
        if (state.forward) thrust = isBoosting ? 12 : 7;
        if (state.backward) thrust = -3;

        player.vx += Math.cos(player.angle) * thrust * dt * 6;
        player.vy += Math.sin(player.angle) * thrust * dt * 6;

        // Friction
        player.vx *= 0.96;
        player.vy *= 0.96;

        // Clamp speed
        const currentSpeed = Math.hypot(player.vx, player.vy);
        if (currentSpeed > currentMaxSpeed) {
          player.vx = (player.vx / currentSpeed) * currentMaxSpeed;
          player.vy = (player.vy / currentSpeed) * currentMaxSpeed;
        }

        player.x += player.vx;
        player.y += player.vy;

        // Screen boundary wrapping/clamping
        if (player.x < 0) player.x = worldWidth;
        if (player.x > worldWidth) player.x = 0;
        if (player.y < 0) player.y = worldHeight;
        if (player.y > worldHeight) player.y = 0;

        // Engine thrust particles
        if (state.forward || isBoosting) {
          const backX = player.x - Math.cos(player.angle) * 15;
          const backY = player.y - Math.sin(player.angle) * 15;
          particles.push({
            x: backX,
            y: backY,
            vx: -Math.cos(player.angle) * (Math.random() * 3 + 2) + (Math.random() - 0.5),
            vy: -Math.sin(player.angle) * (Math.random() * 3 + 2) + (Math.random() - 0.5),
            life: 0,
            maxLife: isBoosting ? 20 : 12,
            color: isBoosting ? '#38bdf8' : '#f97316',
            size: isBoosting ? 5 : 3,
          });
        }

        // Shield Recharge
        if (player.shield < player.maxShield) {
          player.shield = Math.min(player.maxShield, player.shield + player.shieldRegenRate * dt);
        }

        // Cooldown Timers
        player.laserCooldownTimer = Math.max(0, player.laserCooldownTimer - dt);
        player.missileCooldownTimer = Math.max(0, player.missileCooldownTimer - dt);

        // Primary Weapon: Laser
        if (state.fireLaser && player.laserCooldownTimer === 0) {
          player.laserCooldownTimer = 0.15; // 6 shots per sec
          lasers.push({
            id: Math.random().toString(),
            x: player.x + Math.cos(player.angle) * 20,
            y: player.y + Math.sin(player.angle) * 20,
            vx: Math.cos(player.angle) * 14 + player.vx * 0.5,
            vy: Math.sin(player.angle) * 14 + player.vy * 0.5,
            isEnemy: false,
            damage: 20,
            color: '#38bdf8',
          });
          audioSynth.playLaser(settings);
        }

        // Target Lock Determination (nearest enemy within cone)
        let lockedTargetId: string | null = null;
        let minTargetDist = Infinity;

        enemies.forEach((en) => {
          const dx = en.x - player.x;
          const dy = en.y - player.y;
          const dist = Math.hypot(dx, dy);
          const angToEn = Math.atan2(dy, dx);
          let angleDiff = Math.abs(angToEn - player.angle);
          if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

          if (angleDiff < 0.6 && dist < 600 && dist < minTargetDist) {
            minTargetDist = dist;
            lockedTargetId = en.id;
          }
        });

        // Secondary Weapon: Guided Missile
        if (state.fireMissile && player.missileCooldownTimer === 0 && player.missiles > 0) {
          player.missiles--;
          player.missileCooldownTimer = 1.0;
          missiles.push({
            id: Math.random().toString(),
            x: player.x,
            y: player.y,
            vx: Math.cos(player.angle) * 5,
            vy: Math.sin(player.angle) * 5,
            targetId: lockedTargetId || (enemies.length > 0 ? enemies[0].id : null),
            life: 0,
            damage: 100,
          });
          audioSynth.playMissileLaunch(settings);
        }

        // --- Update Lasers ---
        lasers.forEach((l) => {
          l.x += l.vx;
          l.y += l.vy;
        });
        lasers = lasers.filter(
          (l) => l.x >= 0 && l.x <= worldWidth && l.y >= 0 && l.y <= worldHeight
        );

        // --- Update Missiles ---
        missiles.forEach((m) => {
          m.life += dt;
          const target = enemies.find((e) => e.id === m.targetId);
          if (target) {
            const dx = target.x - m.x;
            const dy = target.y - m.y;
            const targetAngle = Math.atan2(dy, dx);
            const currentAngle = Math.atan2(m.vy, m.vx);

            let diff = targetAngle - currentAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            const turnSpeed = 0.12;
            const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
            const speed = 10;
            m.vx = Math.cos(newAngle) * speed;
            m.vy = Math.sin(newAngle) * speed;
          } else {
            // Forward trajectory if target is destroyed
            const spd = Math.hypot(m.vx, m.vy);
            m.vx = (m.vx / spd) * 10;
            m.vy = (m.vy / spd) * 10;
          }

          m.x += m.vx;
          m.y += m.vy;

          // Smoke trail
          particles.push({
            x: m.x,
            y: m.y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            life: 0,
            maxLife: 15,
            color: '#e2e8f0',
            size: 2,
          });
        });
        missiles = missiles.filter((m) => m.life < 5);

        // --- Update Enemy AI & Movement ---
        enemies.forEach((en) => {
          const dx = player.x - en.x;
          const dy = player.y - en.y;
          const dist = Math.hypot(dx, dy);
          en.angle = Math.atan2(dy, dx);

          let speed = 2.5;
          if (en.type === 'scout') speed = 4;
          if (en.type === 'interceptor') speed = 3.2;
          if (en.type === 'heavy') speed = 1.8;
          if (en.type === 'boss') speed = 1.2;

          // Evasion / Flanking logic
          if (dist < 150 && en.type === 'scout') {
            en.vx = -Math.cos(en.angle) * speed;
            en.vy = -Math.sin(en.angle) * speed;
          } else {
            en.vx = Math.cos(en.angle) * speed;
            en.vy = Math.sin(en.angle) * speed;
          }

          en.x += en.vx;
          en.y += en.vy;

          // Enemy Firing Logic
          en.shootCooldown -= dt;
          if (en.shootCooldown <= 0 && dist < 650) {
            en.shootCooldown = en.type === 'scout' ? 1.5 : en.type === 'boss' ? 0.4 : 1.0;
            lasers.push({
              id: Math.random().toString(),
              x: en.x,
              y: en.y,
              vx: Math.cos(en.angle) * 8,
              vy: Math.sin(en.angle) * 8,
              isEnemy: true,
              damage: en.type === 'boss' ? 25 : 12,
              color: en.color,
            });
          }
        });

        // --- Update Asteroids ---
        asteroids.forEach((ast) => {
          ast.x += ast.vx;
          ast.y += ast.vy;
          ast.angle += ast.vRot;

          if (ast.x < -30) ast.x = worldWidth + 30;
          if (ast.x > worldWidth + 30) ast.x = -30;
          if (ast.y < -30) ast.y = worldHeight + 30;
          if (ast.y > worldHeight + 30) ast.y = -30;
        });

        // --- Update Particles ---
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
        });
        particles = particles.filter((p) => p.life < p.maxLife);

        // --- Collision Handling ---

        // 1. Player Lasers vs Enemies
        lasers.forEach((l) => {
          if (l.isEnemy) return;
          enemies.forEach((en) => {
            const dist = Math.hypot(l.x - en.x, l.y - en.y);
            if (dist < en.radius + 4) {
              en.health -= l.damage;
              l.x = -9999; // destroy laser
              spawnExplosion(l.x, l.y, en.color, 6);
              audioSynth.playHit(settings);

              if (en.health <= 0) {
                player.score += en.scoreValue;
                spawnExplosion(en.x, en.y, en.color, en.type === 'boss' ? 60 : 30);
                audioSynth.playExplosion(settings, en.type === 'boss');

                // Chance to drop powerup
                if (Math.random() < 0.35) {
                  const types: Powerup['type'][] = ['health', 'shield', 'missiles', 'boost'];
                  powerups.push({
                    id: Math.random().toString(),
                    x: en.x,
                    y: en.y,
                    type: types[Math.floor(Math.random() * types.length)],
                    radius: 12,
                  });
                }
              }
            }
          });
        });

        // 2. Missiles vs Enemies
        missiles.forEach((m) => {
          enemies.forEach((en) => {
            const dist = Math.hypot(m.x - en.x, m.y - en.y);
            if (dist < en.radius + 8) {
              en.health -= m.damage;
              m.life = 99; // destroy missile
              spawnExplosion(m.x, m.y, '#f59e0b', 35);
              audioSynth.playExplosion(settings, true);

              if (en.health <= 0) {
                player.score += en.scoreValue;
                spawnExplosion(en.x, en.y, en.color, en.type === 'boss' ? 60 : 30);
              }
            }
          });
        });

        // Clean up dead enemies
        enemies = enemies.filter((e) => e.health > 0);

        // 3. Enemy Lasers vs Player
        lasers.forEach((l) => {
          if (!l.isEnemy) return;
          const dist = Math.hypot(l.x - player.x, l.y - player.y);
          if (dist < player.radius + 4) {
            l.x = -9999;
            audioSynth.playHit(settings);
            let dmg = l.damage;
            if (player.shield > 0) {
              const absorbed = Math.min(player.shield, dmg);
              player.shield -= absorbed;
              dmg -= absorbed;
            }
            player.health = Math.max(0, player.health - dmg);
            spawnExplosion(player.x, player.y, '#38bdf8', 8);
          }
        });

        // 4. Player vs Powerups
        powerups.forEach((pow) => {
          const dist = Math.hypot(pow.x - player.x, pow.y - player.y);
          if (dist < player.radius + pow.radius) {
            pow.x = -9999;
            audioSynth.playPowerup(settings);
            if (pow.type === 'health') player.health = Math.min(player.maxHealth, player.health + 35);
            if (pow.type === 'shield') player.shield = Math.min(player.maxShield, player.shield + 50);
            if (pow.type === 'missiles') player.missiles = Math.min(player.maxMissiles, player.missiles + 4);
            if (pow.type === 'boost') player.boostEnergy = player.maxBoostEnergy;
          }
        });
        powerups = powerups.filter((p) => p.x > -100);

        // 5. Player vs Enemy Collisions
        enemies.forEach((en) => {
          const dist = Math.hypot(en.x - player.x, en.y - player.y);
          if (dist < en.radius + player.radius) {
            en.health -= 50;
            player.health -= 20;
            spawnExplosion((en.x + player.x) / 2, (en.y + player.y) / 2, '#ef4444', 20);
            audioSynth.playExplosion(settings);
          }
        });

        // 6. Player & Lasers vs Asteroids
        asteroids.forEach((ast) => {
          const distToPlayer = Math.hypot(ast.x - player.x, ast.y - player.y);
          if (distToPlayer < ast.radius + player.radius) {
            player.health -= 15;
            spawnExplosion(player.x, player.y, '#cbd5e1', 12);
            audioSynth.playHit(settings);
          }

          lasers.forEach((l) => {
            const distToLaser = Math.hypot(ast.x - l.x, ast.y - l.y);
            if (distToLaser < ast.radius) {
              l.x = -9999;
              spawnExplosion(l.x, l.y, '#94a3b8', 6);
            }
          });
        });

        // Check wave completion
        if (enemies.length === 0) {
          player.wave++;
          player.score += 500 * player.wave;
          spawnWave(player.wave);
        }

        // --- HUD State Reporting ---
        onUpdateStats({
          health: player.health,
          maxHealth: player.maxHealth,
          shield: player.shield,
          maxShield: player.maxShield,
          missiles: player.missiles,
          maxMissiles: player.maxMissiles,
          laserCooldown: player.laserCooldownTimer,
          missileCooldown: player.missileCooldownTimer,
          score: player.score,
          wave: player.wave,
          boostEnergy: player.boostEnergy,
          maxBoostEnergy: player.maxBoostEnergy,
          isBoosting,
        });

        onUpdateWeapon({
          canFireLaser: player.laserCooldownTimer === 0,
          laserCooldownRatio: player.laserCooldownTimer / 0.15,
          canFireMissile: player.missileCooldownTimer === 0 && player.missiles > 0,
          missileCooldownRatio: player.missileCooldownTimer / 1.0,
          hasTargetLock: lockedTargetId !== null,
          targetId: lockedTargetId,
        });

        // Radar blips normalized from -1 to 1 relative to screen center
        const radarBlipsData = enemies.map((en) => ({
          x: (en.x - player.x) / (worldWidth / 2),
          y: (en.y - player.y) / (worldHeight / 2),
          isEnemy: true,
          isBoss: en.type === 'boss',
        }));
        onUpdateRadar(radarBlipsData);
      }

      // --- RENDERING CANVAS 2D ---
      ctx.clearRect(0, 0, worldWidth, worldHeight);

      // 1. Scenario Background Theme
      const bgGrad = ctx.createRadialGradient(
        worldWidth / 2,
        worldHeight / 2,
        100,
        worldWidth / 2,
        worldHeight / 2,
        worldWidth
      );

      if (scenario === 'alien') {
        bgGrad.addColorStop(0, '#022c22');
        bgGrad.addColorStop(1, '#020617');
      } else if (scenario === 'asteroids') {
        bgGrad.addColorStop(0, '#1c1917');
        bgGrad.addColorStop(1, '#020617');
      } else if (scenario === 'station') {
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(1, '#020617');
      } else if (scenario === 'nebula') {
        bgGrad.addColorStop(0, '#3b0764');
        bgGrad.addColorStop(1, '#020617');
      } else {
        bgGrad.addColorStop(0, '#450a0a');
        bgGrad.addColorStop(1, '#020617');
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, worldWidth, worldHeight);

      // Stars
      ctx.fillStyle = '#ffffff';
      stars.forEach((s) => {
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 2. Draw Asteroids
      asteroids.forEach((ast) => {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.angle);
        ctx.strokeStyle = '#78716c';
        ctx.fillStyle = '#292524';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, ast.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // 3. Draw Powerups
      powerups.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.lineWidth = 2;
        if (p.type === 'health') ctx.strokeStyle = '#10b981';
        if (p.type === 'shield') ctx.strokeStyle = '#38bdf8';
        if (p.type === 'missiles') ctx.strokeStyle = '#f59e0b';
        if (p.type === 'boost') ctx.strokeStyle = '#a855f7';

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.type[0].toUpperCase(), 0, 0);
        ctx.restore();
      });

      // 4. Draw Particles
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 5. Draw Lasers
      lasers.forEach((l) => {
        ctx.save();
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x - l.vx * 1.5, l.y - l.vy * 1.5);
        ctx.stroke();
        ctx.restore();
      });

      // 6. Draw Missiles
      missiles.forEach((m) => {
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(Math.atan2(m.vy, m.vx));
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.rect(-6, -3, 12, 6);
        ctx.fill();
        ctx.restore();
      });

      // 7. Draw Enemies
      enemies.forEach((en) => {
        ctx.save();
        ctx.translate(en.x, en.y);
        ctx.rotate(en.angle);

        ctx.fillStyle = en.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;

        // Custom shape depending on enemy type
        ctx.beginPath();
        if (en.type === 'scout') {
          ctx.moveTo(en.radius, 0);
          ctx.lineTo(-en.radius, -en.radius * 0.7);
          ctx.lineTo(-en.radius * 0.5, 0);
          ctx.lineTo(-en.radius, en.radius * 0.7);
        } else if (en.type === 'boss') {
          ctx.moveTo(en.radius, 0);
          ctx.lineTo(en.radius * 0.3, -en.radius);
          ctx.lineTo(-en.radius, -en.radius * 0.8);
          ctx.lineTo(-en.radius * 0.4, 0);
          ctx.lineTo(-en.radius, en.radius * 0.8);
          ctx.lineTo(en.radius * 0.3, en.radius);
        } else {
          ctx.moveTo(en.radius, 0);
          ctx.lineTo(-en.radius, -en.radius);
          ctx.lineTo(-en.radius, en.radius);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Enemy Health bar
        if (en.health < en.maxHealth) {
          ctx.rotate(-en.angle);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-20, -en.radius - 12, 40, 5);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-20, -en.radius - 12, 40 * (en.health / en.maxHealth), 5);
        }

        ctx.restore();
      });

      // 8. Draw Player Ship
      if (player.health > 0) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);

        // Ship Body
        ctx.fillStyle = '#0ea5e9';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = player.shield > 0 ? 10 : 0;

        ctx.beginPath();
        ctx.moveTo(player.radius + 4, 0);
        ctx.lineTo(-player.radius, -player.radius * 0.8);
        ctx.lineTo(-player.radius * 0.4, 0);
        ctx.lineTo(-player.radius, player.radius * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shield Bubble
        if (player.shield > 0) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.3 + (player.shield / player.maxShield) * 0.4})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      globalThis.removeEventListener('resize', resizeCanvas);
      input.detach();
    };
  }, [scenario, settings, isPaused, onGameOver, onUpdateStats, onUpdateWeapon, onUpdateRadar]);

  return <canvas ref={canvasRef} className="w-full h-full block bg-black" />;
};
