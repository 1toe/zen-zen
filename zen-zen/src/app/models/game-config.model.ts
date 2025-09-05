import { GameMode, Difficulty } from './game-state.enum';
import { Size } from './player.model';

/**
 * Configuración de física del juego
 */
export interface PhysicsConfig {
  /** Gravedad aplicada al jugador */
  gravity: number;
  
  /** Fricción para el movimiento */
  friction: number;
  
  /** Velocidad máxima del jugador */
  maxSpeed: number;
  
  /** Fuerza de impulso del jugador */
  impulseForce: number;
  
  /** Amortiguación de velocidad */
  damping: number;
}

/**
 * Configuración de generación de objetos
 */
export interface SpawningConfig {
  /** Tasa de aparición de obstáculos (obstáculos/segundo) */
  obstacleRate: number;
  
  /** Tasa de aparición de power-ups (power-ups/segundo) */
  powerUpRate: number;
  
  /** Distancia mínima entre obstáculos */
  minObstacleDistance: number;
  
  /** Número máximo de obstáculos simultáneos */
  maxObstacles: number;
  
  /** Número máximo de power-ups simultáneos */
  maxPowerUps: number;
}

/**
 * Configuración visual y de renderizado
 */
export interface RenderConfig {
  /** Objetivo de FPS para el juego */
  targetFPS: number;
  
  /** Tamaño del canvas */
  canvasSize: Size;
  
  /** Color de fondo en formato hex */
  backgroundColor: string;
  
  /** Configuración de partículas */
  particles: {
    enabled: boolean;
    maxCount: number;
    fadeSpeed: number;
  };
  
  /** Configuración de efectos visuales */
  effects: {
    bloom: boolean;
    trails: boolean;
    screenShake: boolean;
  };
}

/**
 * Configuración de audio
 */
export interface AudioConfig {
  /** Volumen maestro (0-1) */
  masterVolume: number;
  
  /** Volumen de efectos de sonido (0-1) */
  sfxVolume: number;
  
  /** Volumen de música ambiental (0-1) */
  musicVolume: number;
  
  /** Si el audio está habilitado */
  enabled: boolean;
}

/**
 * Configuración completa del juego
 */
export interface GameConfig {
  /** Dificultad del juego */
  difficulty: Difficulty;
  
  /** Modo de juego */
  mode: GameMode;
  
  /** Configuración de física */
  physics: PhysicsConfig;
  
  /** Configuración de generación */
  spawning: SpawningConfig;
  
  /** Configuración de renderizado */
  render: RenderConfig;
  
  /** Configuración de audio */
  audio: AudioConfig;
  
  /** Configuraciones específicas del modo meditación */
  meditation: {
    visualCalmness: number; // 0-1, qué tan calmados son los visuales
    obstacleReduction: number; // 0-1, reducción de obstáculos
    gentleColors: boolean; // Usar colores suaves
  };
}

/**
 * Factory para crear configuración por defecto
 */
export function createDefaultGameConfig(): GameConfig {
  return {
    difficulty: Difficulty.NORMAL,
    mode: GameMode.NORMAL,
    physics: {
      gravity: 0.5,
      friction: 0.98,
      maxSpeed: 8,
      impulseForce: 12,
      damping: 0.95
    },
    spawning: {
      obstacleRate: 0.8,
      powerUpRate: 0.3,
      minObstacleDistance: 100,
      maxObstacles: 15,
      maxPowerUps: 5
    },
    render: {
      targetFPS: 60,
      canvasSize: { width: 800, height: 600 },
      backgroundColor: '#1a1a2e',
      particles: {
        enabled: true,
        maxCount: 100,
        fadeSpeed: 0.02
      },
      effects: {
        bloom: true,
        trails: true,
        screenShake: false
      }
    },
    audio: {
      masterVolume: 0.7,
      sfxVolume: 0.8,
      musicVolume: 0.5,
      enabled: true
    },
    meditation: {
      visualCalmness: 0.7,
      obstacleReduction: 0.6,
      gentleColors: true
    }
  };
}

/**
 * Crear configuración específica para modo meditación
 */
export function createMeditationConfig(): GameConfig {
  const config = createDefaultGameConfig();
  
  return {
    ...config,
    mode: GameMode.MEDITATION,
    physics: {
      ...config.physics,
      gravity: 0.3,
      maxSpeed: 5,
      impulseForce: 8
    },
    spawning: {
      ...config.spawning,
      obstacleRate: 0.4,
      powerUpRate: 0.5
    },
    render: {
      ...config.render,
      backgroundColor: '#2c3e50',
      effects: {
        ...config.render.effects,
        screenShake: false
      }
    },
    meditation: {
      visualCalmness: 0.9,
      obstacleReduction: 0.8,
      gentleColors: true
    }
  };
}
