import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScenarioType, Settings, PlayerStats, WeaponStatus } from '../types/game';
import { InputManager } from '../systems/input';
import { audioSynth } from '../utils/audio';

export interface Game3DProps {
  scenario: ScenarioType;
  settings: Settings;
  isPaused: boolean;
  onUpdateStats: (stats: PlayerStats) => void;
  onUpdateWeapon: (weapon: WeaponStatus) => void;
  onUpdateRadar: (blips: Array<{ x: number; y: number; isEnemy: boolean; isBoss?: boolean }>) => void;
  onGameOver: () => void;
}

interface Enemy3D {
  id: string;
  mesh: THREE.Group;
  health: number;
  maxHealth: number;
  type: 'scout' | 'interceptor' | 'heavy' | 'boss';
  shootCooldown: number;
  scoreValue: number;
  velocity: THREE.Vector3;
}

interface Laser3D {
  id: string;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  isEnemy: boolean;
  damage: number;
  life: number;
}

interface Missile3D {
  id: string;
  mesh: THREE.Group;
  velocity: THREE.Vector3;
  targetId: string | null;
  life: number;
  damage: number;
}

interface Powerup3D {
  id: string;
  mesh: THREE.Mesh;
  type: 'health' | 'shield' | 'missiles' | 'boost';
}

export const Game3DCanvas: React.FC<Game3DProps> = ({
  scenario,
  settings,
  isPaused,
  onUpdateStats,
  onUpdateWeapon,
  onUpdateRadar,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const input = new InputManager();
    input.attach();

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0012);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight.position.set(200, 300, 100);
    scene.add(dirLight);

    // --- SCENARIO SPECIFIC ENVIRONMENT ---
    const createEnvironment = () => {
      // Starfield particles
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 3000;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 3000;
        starPositions[i + 1] = (Math.random() - 0.5) * 3000;
        starPositions[i + 2] = (Math.random() - 0.5) * 3000;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.8 });
      const starPoints = new THREE.Points(starGeometry, starMaterial);
      scene.add(starPoints);

      // Celestial Bodies (Planet / Asteroids / Nebula)
      if (scenario === 'alien') {
        // Alien Planet with Atmosphere
        const planetGeo = new THREE.SphereGeometry(250, 32, 32);
        const planetMat = new THREE.MeshStandardMaterial({
          color: 0x059669,
          roughness: 0.8,
          wireframe: false,
        });
        const planet = new THREE.Mesh(planetGeo, planetMat);
        planet.position.set(0, -350, -800);
        scene.add(planet);
      } else if (scenario === 'asteroids') {
        // Asteroid Field
        const astGeo = new THREE.DodecahedronGeometry(15, 1);
        const astMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.9 });
        for (let i = 0; i < 60; i++) {
          const ast = new THREE.Mesh(astGeo, astMat);
          ast.position.set(
            (Math.random() - 0.5) * 1200,
            (Math.random() - 0.5) * 800,
            (Math.random() - 0.5) * 1200
          );
          ast.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
          const scale = Math.random() * 2 + 0.5;
          ast.scale.set(scale, scale, scale);
          scene.add(ast);
        }
      } else if (scenario === 'station') {
        // Space Station Core
        const stationGroup = new THREE.Group();
        const coreGeo = new THREE.CylinderGeometry(40, 40, 200, 16);
        const ringGeo = new THREE.TorusGeometry(120, 10, 16, 32);
        const stationMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

        const core = new THREE.Mesh(coreGeo, stationMat);
        const ring = new THREE.Mesh(ringGeo, stationMat);
        ring.rotation.x = Math.PI / 2;

        stationGroup.add(core);
        stationGroup.add(ring);
        stationGroup.position.set(0, 0, -600);
        scene.add(stationGroup);
      } else if (scenario === 'nebula') {
        // Purple Nebula Dust Particle Cloud
        const nebulaGeo = new THREE.BufferGeometry();
        const nebPos = new Float32Array(800 * 3);
        for (let i = 0; i < 800 * 3; i += 3) {
          nebPos[i] = (Math.random() - 0.5) * 1000;
          nebPos[i + 1] = (Math.random() - 0.5) * 1000;
          nebPos[i + 2] = (Math.random() - 0.5) * 1000;
        }
        nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
        const nebMat = new THREE.PointsMaterial({ color: 0xa855f7, size: 8, transparent: true, opacity: 0.5 });
        const nebula = new THREE.Points(nebulaGeo, nebMat);
        scene.add(nebula);
      }
    };

    createEnvironment();

    // --- PLAYER STATE ---
    const player = {
      position: new THREE.Vector3(0, 0, 0),
      quaternion: new THREE.Quaternion(),
      velocity: new THREE.Vector3(0, 0, 0),
      speed: 0,
      maxSpeed: 40,
      boostSpeed: 80,
      health: 100,
      maxHealth: 100,
      shield: 100,
      maxShield: 100,
      missiles: 10,
      maxMissiles: 10,
      boostEnergy: 100,
      maxBoostEnergy: 100,
      score: 0,
      wave: 1,
      laserCooldown: 0,
      missileCooldown: 0,
    };

    camera.position.copy(player.position);

    // Dynamic Lists
    let enemies: Enemy3D[] = [];
    let lasers: Laser3D[] = [];
    let missiles: Missile3D[] = [];
    let powerups: Powerup3D[] = [];

    // Model Generators for 3D Enemies
    const createEnemyMesh = (type: Enemy3D['type']): THREE.Group => {
      const group = new THREE.Group();
      let matColor = 0xef4444;
      if (type === 'interceptor') matColor = 0xf97316;
      if (type === 'heavy') matColor = 0xa855f7;
      if (type === 'boss') matColor = 0xec4899;

      const mat = new THREE.MeshStandardMaterial({ color: matColor, metalness: 0.6, roughness: 0.4 });

      if (type === 'boss') {
        const bodyGeo = new THREE.ConeGeometry(20, 60, 8);
        const wingGeo = new THREE.BoxGeometry(80, 4, 20);
        const body = new THREE.Mesh(bodyGeo, mat);
        const wing = new THREE.Mesh(wingGeo, mat);
        body.rotation.x = Math.PI / 2;
        group.add(body);
        group.add(wing);
      } else {
        const bodyGeo = new THREE.ConeGeometry(5, 18, 6);
        const wingGeo = new THREE.BoxGeometry(20, 2, 8);
        const body = new THREE.Mesh(bodyGeo, mat);
        const wing = new THREE.Mesh(wingGeo, mat);
        body.rotation.x = Math.PI / 2;
        group.add(body);
        group.add(wing);
      }

      scene.add(group);
      return group;
    };

    const spawnWave3D = (waveNum: number) => {
      // Clear existing enemies
      enemies.forEach((e) => scene.remove(e.mesh));
      enemies = [];

      const countFactor = settings.difficulty === 'hard' ? 1.4 : settings.difficulty === 'easy' ? 0.7 : 1.0;
      const count = Math.floor((3 + waveNum * 2) * countFactor);
      const isBossWave = waveNum % 3 === 0;

      for (let i = 0; i < count; i++) {
        const type: Enemy3D['type'] = i % 3 === 0 ? 'interceptor' : i % 5 === 0 ? 'heavy' : 'scout';
        const mesh = createEnemyMesh(type);

        // Spawn around player in a sphere radius
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 300 + Math.random() * 300;

        mesh.position.set(
          player.position.x + r * Math.sin(phi) * Math.cos(theta),
          player.position.y + r * Math.sin(phi) * Math.sin(theta),
          player.position.z + r * Math.cos(phi)
        );

        let hp = 40;
        if (type === 'interceptor') hp = 80;
        if (type === 'heavy') hp = 150;

        enemies.push({
          id: Math.random().toString(),
          mesh,
          health: hp,
          maxHealth: hp,
          type,
          shootCooldown: Math.random() * 2,
          scoreValue: hp * 5,
          velocity: new THREE.Vector3(),
        });
      }

      if (isBossWave) {
        const mesh = createEnemyMesh('boss');
        mesh.position.set(player.position.x, player.position.y, player.position.z - 400);
        const hp = 600 + waveNum * 150;
        enemies.push({
          id: Math.random().toString(),
          mesh,
          health: hp,
          maxHealth: hp,
          type: 'boss',
          shootCooldown: 0.5,
          scoreValue: 2000,
          velocity: new THREE.Vector3(),
        });
      }
    };

    spawnWave3D(player.wave);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();

    // --- MAIN ANIMATION LOOP ---
    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isPaused) {
        const state = input.getState();

        if (player.health <= 0) {
          audioSynth.playExplosion(settings, true);
          onGameOver();
          return;
        }

        // --- Player Rotation & Flight Controls ---
        const rotSpeed = 1.2 * dt;
        const pitchInvert = settings.invertedY ? -1 : 1;

        if (state.pitchUp) camera.rotateX(rotSpeed * pitchInvert);
        if (state.pitchDown) camera.rotateX(-rotSpeed * pitchInvert);
        if (state.turnLeft) camera.rotateY(rotSpeed);
        if (state.turnRight) camera.rotateY(-rotSpeed);
        if (state.rollLeft) camera.rotateZ(rotSpeed);
        if (state.rollRight) camera.rotateZ(-rotSpeed);

        // Boost logic
        const isBoosting = state.boost && player.boostEnergy > 5;
        player.boostEnergy = isBoosting
          ? Math.max(0, player.boostEnergy - 35 * dt)
          : Math.min(player.maxBoostEnergy, player.boostEnergy + 15 * dt);

        const curMaxSpeed = isBoosting ? player.boostSpeed : player.maxSpeed;
        const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

        let accel = 0;
        if (state.forward) accel = isBoosting ? 100 : 50;
        if (state.backward) accel = -25;

        player.velocity.add(forwardDir.multiplyScalar(accel * dt));
        player.velocity.multiplyScalar(0.97); // Damping friction

        if (player.velocity.length() > curMaxSpeed) {
          player.velocity.setLength(curMaxSpeed);
        }

        player.position.addScaledVector(player.velocity, dt);
        camera.position.copy(player.position);

        // Shield Regen
        if (player.shield < player.maxShield) {
          player.shield = Math.min(player.maxShield, player.shield + 4 * dt);
        }

        // Weapon Timers
        player.laserCooldown = Math.max(0, player.laserCooldown - dt);
        player.missileCooldown = Math.max(0, player.missileCooldown - dt);

        // Firing 3D Lasers
        if (state.fireLaser && player.laserCooldown === 0) {
          player.laserCooldown = 0.15;

          const laserGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 8);
          const laserMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const laserMesh = new THREE.Mesh(laserGeo, laserMat);

          laserMesh.position.copy(player.position).add(forwardDir.clone().multiplyScalar(5));
          laserMesh.quaternion.copy(camera.quaternion);
          laserMesh.rotateX(Math.PI / 2);

          scene.add(laserMesh);

          const laserVel = forwardDir.clone().multiplyScalar(300).add(player.velocity);
          lasers.push({
            id: Math.random().toString(),
            mesh: laserMesh,
            velocity: laserVel,
            isEnemy: false,
            damage: 25,
            life: 0,
          });

          audioSynth.playLaser(settings);
        }

        // Target Lock Determination (3D Cone Angle)
        let targetLockId: string | null = null;
        let bestLockAngle = 0.3; // Radians threshold (~17 deg)

        enemies.forEach((en) => {
          const toEnemy = en.mesh.position.clone().sub(player.position).normalize();
          const angle = forwardDir.angleTo(toEnemy);
          if (angle < bestLockAngle) {
            bestLockAngle = angle;
            targetLockId = en.id;
          }
        });

        // Firing 3D Missiles
        if (state.fireMissile && player.missileCooldown === 0 && player.missiles > 0) {
          player.missiles--;
          player.missileCooldown = 1.0;

          const group = new THREE.Group();
          const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
          const mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
          const body = new THREE.Mesh(bodyGeo, mat);
          body.rotation.x = Math.PI / 2;
          group.add(body);

          group.position.copy(player.position);
          group.quaternion.copy(camera.quaternion);
          scene.add(group);

          const missileVel = forwardDir.clone().multiplyScalar(80);
          missiles.push({
            id: Math.random().toString(),
            mesh: group,
            velocity: missileVel,
            targetId: targetLockId || (enemies.length > 0 ? enemies[0].id : null),
            life: 0,
            damage: 120,
          });

          audioSynth.playMissileLaunch(settings);
        }

        // --- Update 3D Lasers ---
        lasers.forEach((l) => {
          l.mesh.position.addScaledVector(l.velocity, dt);
          l.life += dt;
        });
        lasers.forEach((l) => {
          if (l.life >= 3) scene.remove(l.mesh);
        });
        lasers = lasers.filter((l) => l.life < 3);

        // --- Update 3D Missiles ---
        missiles.forEach((m) => {
          m.life += dt;
          const target = enemies.find((e) => e.id === m.targetId);
          if (target) {
            const targetDir = target.mesh.position.clone().sub(m.mesh.position).normalize();
            m.velocity.lerp(targetDir.multiplyScalar(150), 0.1);
            m.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), m.velocity.clone().normalize());
          }
          m.mesh.position.addScaledVector(m.velocity, dt);
        });
        missiles.forEach((m) => {
          if (m.life >= 6) scene.remove(m.mesh);
        });
        missiles = missiles.filter((m) => m.life < 6);

        // --- Update 3D Enemies & AI Movement ---
        enemies.forEach((en) => {
          const toPlayer = player.position.clone().sub(en.mesh.position);
          const dist = toPlayer.length();
          const dir = toPlayer.normalize();

          // Face towards player
          en.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);

          // Fly towards or orbit player
          const speed = en.type === 'boss' ? 20 : 50;
          if (dist > 80) {
            en.mesh.position.addScaledVector(dir, speed * dt);
          }

          // Enemy firing 3D lasers
          en.shootCooldown -= dt;
          if (en.shootCooldown <= 0 && dist < 500) {
            en.shootCooldown = en.type === 'boss' ? 0.4 : 1.2;

            const laserGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 8);
            const laserMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
            const laserMesh = new THREE.Mesh(laserGeo, laserMat);

            laserMesh.position.copy(en.mesh.position);
            laserMesh.quaternion.copy(en.mesh.quaternion);

            scene.add(laserMesh);

            lasers.push({
              id: Math.random().toString(),
              mesh: laserMesh,
              velocity: dir.clone().multiplyScalar(180),
              isEnemy: true,
              damage: en.type === 'boss' ? 20 : 10,
              life: 0,
            });
          }
        });

        // --- 3D Collision Detection ---

        // 1. Player Lasers vs Enemies
        lasers.forEach((l) => {
          if (l.isEnemy) return;
          enemies.forEach((en) => {
            const dist = l.mesh.position.distanceTo(en.mesh.position);
            const hitRadius = en.type === 'boss' ? 30 : 12;
            if (dist < hitRadius) {
              en.health -= l.damage;
              l.life = 99; // destroy laser
              audioSynth.playHit(settings);

              if (en.health <= 0) {
                player.score += en.scoreValue;
                audioSynth.playExplosion(settings, en.type === 'boss');
                scene.remove(en.mesh);

                // Chance to drop powerup
                if (Math.random() < 0.4) {
                  const powGeo = new THREE.OctahedronGeometry(4);
                  const powMat = new THREE.MeshStandardMaterial({ color: 0x10b981, wireframe: true });
                  const powMesh = new THREE.Mesh(powGeo, powMat);
                  powMesh.position.copy(en.mesh.position);
                  scene.add(powMesh);

                  const types: Powerup3D['type'][] = ['health', 'shield', 'missiles', 'boost'];
                  powerups.push({
                    id: Math.random().toString(),
                    mesh: powMesh,
                    type: types[Math.floor(Math.random() * types.length)],
                  });
                }
              }
            }
          });
        });

        // 2. Missiles vs Enemies
        missiles.forEach((m) => {
          enemies.forEach((en) => {
            const dist = m.mesh.position.distanceTo(en.mesh.position);
            const hitRadius = en.type === 'boss' ? 35 : 15;
            if (dist < hitRadius) {
              en.health -= m.damage;
              m.life = 99;
              audioSynth.playExplosion(settings, true);
              scene.remove(m.mesh);

              if (en.health <= 0) {
                player.score += en.scoreValue;
                scene.remove(en.mesh);
              }
            }
          });
        });

        enemies = enemies.filter((e) => e.health > 0);

        // 3. Enemy Lasers vs Player
        lasers.forEach((l) => {
          if (!l.isEnemy) return;
          const dist = l.mesh.position.distanceTo(player.position);
          if (dist < 10) {
            l.life = 99;
            audioSynth.playHit(settings);

            let dmg = l.damage;
            if (player.shield > 0) {
              const absorbed = Math.min(player.shield, dmg);
              player.shield -= absorbed;
              dmg -= absorbed;
            }
            player.health = Math.max(0, player.health - dmg);
          }
        });

        // 4. Powerup Collection
        powerups.forEach((pow) => {
          pow.mesh.rotation.y += 0.05;
          const dist = pow.mesh.position.distanceTo(player.position);
          if (dist < 15) {
            scene.remove(pow.mesh);
            audioSynth.playPowerup(settings);
            if (pow.type === 'health') player.health = Math.min(player.maxHealth, player.health + 35);
            if (pow.type === 'shield') player.shield = Math.min(player.maxShield, player.shield + 50);
            if (pow.type === 'missiles') player.missiles = Math.min(player.maxMissiles, player.missiles + 4);
            if (pow.type === 'boost') player.boostEnergy = player.maxBoostEnergy;
          }
        });
        powerups = powerups.filter((p) => p.mesh.parent !== null);

        // Check wave progression
        if (enemies.length === 0) {
          player.wave++;
          player.score += 1000 * player.wave;
          spawnWave3D(player.wave);
        }

        // --- HUD State Reporting ---
        onUpdateStats({
          health: player.health,
          maxHealth: player.maxHealth,
          shield: player.shield,
          maxShield: player.maxShield,
          missiles: player.missiles,
          maxMissiles: player.maxMissiles,
          laserCooldown: player.laserCooldown,
          missileCooldown: player.missileCooldown,
          score: player.score,
          wave: player.wave,
          boostEnergy: player.boostEnergy,
          maxBoostEnergy: player.maxBoostEnergy,
          isBoosting,
        });

        onUpdateWeapon({
          canFireLaser: player.laserCooldown === 0,
          laserCooldownRatio: player.laserCooldown / 0.15,
          canFireMissile: player.missileCooldown === 0 && player.missiles > 0,
          missileCooldownRatio: player.missileCooldown / 1.0,
          hasTargetLock: targetLockId !== null,
          targetId: targetLockId,
        });

        // 3D Radar Blips (transformed into local camera space)
        const radarBlips = enemies.map((en) => {
          const relPos = en.mesh.position.clone().sub(player.position);
          relPos.applyQuaternion(camera.quaternion.clone().invert());
          return {
            x: relPos.x / 400,
            y: relPos.z / 400, // Z is forward/backward in 3D camera
            isEnemy: true,
            isBoss: en.type === 'boss',
          };
        });
        onUpdateRadar(radarBlips);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      input.detach();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [scenario, settings, isPaused, onGameOver, onUpdateStats, onUpdateWeapon, onUpdateRadar]);

  return <div ref={containerRef} className="w-full h-full block bg-black" />;
};
