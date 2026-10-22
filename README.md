# STARFALL: SPACE COMBAT

**STARFALL: SPACE COMBAT** es un videojuego de naves espaciales futurista para navegador, diseñado para un solo jugador contra IA en entornos 2D Arcade y 3D en primera persona.

---

## 🚀 Características
- **Modo Arcade 2D**: Desplazamiento espacial, disparos láser, misiles guiados, colisiones con asteroides, jefes y potenciadores.
- **Modo Simulador 3D**: Perspectiva frontal/cabina tridimensional con modelos procedimentales, planetas, estaciones espaciales, asteroides y combate cinemático.
- **5 Escenarios Únicos**:
  1. *Planeta Alienígena*: Órbita tóxica con planeta gigante.
  2. *Campo de Asteroides*: Cinturón denso de rocas flotantes.
  3. *Estación Hostil*: Infiltración alrededor de una megaestructura militar.
  4. *Nebulosa Oscura*: Tormenta de polvo cósmico y partículas electromagnéticas.
  5. *Zona de Guerra Espacial*: Batalla campal contra naves insignia.
- **IA Enemiga Avanzada**: Comportamiento de persecución, maniobras de evasión y ataques por oleadas con jefes especiales.
- **Armamento Completo**:
  - *Láser Principal*: Disparo rápido con enfriamiento.
  - *Misiles Secundarios*: Fijación automática de objetivos con seguimiento homing.
- **HUD Interactivo**: Escudos, casco de la nave, turbo de impulso, contador de oleadas, puntuación en tiempo real, retícula de apuntado y radar espacial.
- **Audio Sintetizado**: Efectos de sonido dinámicos creados con Web Audio API (láseres, explosiones, impactos, lanzamientos e impulso).
- **Persistencia Local**: Guardado de récords (High Scores) y ajustes personalizados (volumen, dificultad, inversión de eje Y).

---

## 🕹️ Controles del Juego

| Acción | Teclas |
| :--- | :--- |
| **Acelerar / Desacelerar** | `W` / `S` (o Flecha Arriba / Flecha Abajo) |
| **Girar / Maniobrar** | `A` / `D` (o Flecha Izquierda / Flecha Derecha) |
| **Inclinación Pitch (3D)** | Flechas Arriba / Abajo o Ratón |
| **Alabeo Roll (3D)** | `Q` / `E` |
| **Disparar Láser** | `Espacio` o Clic Izquierdo del Ratón |
| **Lanzar Misil Guiado** | `F` |
| **Activar Impulso (Turbo)** | `Shift` (Shift Izquierdo o Derecho) |
| **Pausar Juego** | `Esc` |

---

## 🛠️ Requisitos e Instalación

### Prerrequisitos
- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior

### Pasos de Instalación
```bash
# 1. Clonar o navegar al directorio del proyecto
cd starfall

# 2. Instalar las dependencias
npm install

# 3. Iniciar el servidor de desarrollo Vite
npm run dev

# 4. Comprobar la compilación de TypeScript
npm run check

# 5. Generar la compilación de producción
npm run build
```

---

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/
│   ├── MainMenu.tsx         # Menú principal y selección de misiones
│   ├── HUD.tsx              # Interfaz de usuario durante el combate
│   ├── PauseMenu.tsx        # Menú de pausa
│   ├── GameOverModal.tsx    # Pantalla de victoria/derrota y registro de récord
│   ├── SettingsModal.tsx    # Modal de configuración
│   ├── HighScoresModal.tsx  # Tabla de récords locales
│   ├── Game2DCanvas.tsx     # Motor 2D en Canvas HTML5
│   └── Game3DCanvas.tsx     # Motor 3D en Three.js / WebGL
├── systems/
│   └── input.ts             # Gestor de entradas de teclado y ratón
├── types/
│   └── game.ts              # Modelos de datos y tipos de TypeScript
├── utils/
│   ├── audio.ts             # Sintetizador de sonido con Web Audio API
│   └── storage.ts           # Guardado de datos en LocalStorage
├── App.tsx                  # Componente principal y gestión de estado
└── main.tsx                 # Punto de entrada React
```

---

## 📄 Licencia
MIT License.
