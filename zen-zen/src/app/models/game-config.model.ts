import { GameMode, Difficulty, EnergyType } from './game-state.enum';
import { Size } from './player.model';

/**
 * Configuración de física del juego
 */
export interface PhysicsConfig {
  /** Gravedad aplicada al núcleo (0 para desactivar) */
  gravity: number;
  
  /** Fricción para el movimiento */
  friction: number;
  
  /** Velocidad máxima del núcleo */
  maxSpeed: number;
  
  /** Fuerza de impulso del núcleo */
  impulseForce: number;
  
  /** Amortiguación de velocidad */
  damping: number;
  
  /** Velocidad de propagación de ondas base */
  waveSpeed: number;
  
  /** Distancia máxima de propagación de ondas */
  maxWaveDistance: number;
}

/**
 * Configuración de generación de objetos
 */
export interface SpawningConfig {
  /** Tasa de aparición de disonancias (disonancias/segundo) */
  dissonanceRate: number;
  
  /** Tasa de aparición de amplificadores (amplificadores/segundo) */
  amplifierRate: number;
  
  /** Tiempo entre generación de patrones (segundos) */
  patternInterval: number;
  
  /** Número máximo de disonancias simultáneas */
  maxDissonances: number;
  
  /** Número máximo de amplificadores simultáneos */
  maxAmplifiers: number;
  
  /** Número de resonadores iniciales */
  initialResonators: number;
  
  /** Número máximo de resonadores */
  maxResonators: number;
  
  /** Número máximo de ondas armónicas simultáneas */
  maxHarmonicWaves: number;
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
    waveGlow: boolean;
  };
  
  /** Intensidad de brillo global (0-1) */
  brightness: number;
  
  /** Escala de objetos (1 es tamaño normal) */
  scale: number;
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
  
  /** Armonía musical activada (adapta la música al juego) */
  musicalHarmony: boolean;
}

/**
 * Configuración de energía
 */
export interface EnergyConfig {
  /** Balance inicial entre energías */
  initialBalance: {
    [EnergyType.CALM]: number;
    [EnergyType.VIBRANT]: number;
    [EnergyType.INTENSE]: number;
  };
  
  /** Tasa de decaimiento natural de energía */
  decayRate: number;
  
  /** Umbral de desbalance que causa efectos negativos (0-1) */
  imbalanceThreshold: number;
  
  /** Penalización por desbalance extremo */
  imbalancePenalty: number;
  
  /** Bonificación por balance perfecto */
  balanceBonus: number;
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
  
  /** Configuración de generación de objetos */
  spawning: SpawningConfig;
  
  /** Configuración visual */
  rendering: RenderConfig;
  
  /** Configuración de audio */
  audio: AudioConfig;
  
  /** Configuración de energía */
  energy: EnergyConfig;
  
  /** Si el modo de depuración está activo */
  debugMode: boolean;
}

/**
 * Crear configuración por defecto
 */
export function createDefaultGameConfig(): GameConfig {
  return {
    difficulty: Difficulty.ADEPT,
    mode: GameMode.HARMONY,
    physics: {
      gravity: 0,
      friction: 0.98,
      maxSpeed: 5,
      impulseForce: 0.5,
      damping: 0.95,
      waveSpeed: 120,
      maxWaveDistance: 300
    },
    spawning: {
      dissonanceRate: 0.3,
      amplifierRate: 0.15,
      patternInterval: 20,
      maxDissonances: 5,
      maxAmplifiers: 3,
      initialResonators: 5,
      maxResonators: 12,
      maxHarmonicWaves: 10
    },
    rendering: {
      targetFPS: 60,
      canvasSize: { width: 550, height: 550 },
      backgroundColor: '#1e1e2e',
      particles: {
        enabled: true,
        maxCount: 2000,
        fadeSpeed: 0.02
      },
      effects: {
        bloom: true,
        trails: true,
        screenShake: true,
        waveGlow: true
      },
      brightness: 0.8,
      scale: 1.0
    },
    audio: {
      masterVolume: 0.8,
      sfxVolume: 0.7,
      musicVolume: 0.5,
      enabled: true,
      musicalHarmony: true
    },
    energy: {
      initialBalance: {
        [EnergyType.CALM]: 33,
        [EnergyType.VIBRANT]: 33,
        [EnergyType.INTENSE]: 34
      },
      decayRate: 0.1,
      imbalanceThreshold: 0.3,
      imbalancePenalty: 5,
      balanceBonus: 2
    },
    debugMode: false
  };
}

/**
 * Crear configuración para modo Armonía (enfocado en experiencia zen)
 */
export function createHarmonyConfig(): GameConfig {
  const config = createDefaultGameConfig();
  config.mode = GameMode.HARMONY;
  config.physics.gravity = 0;
  config.physics.friction = 0.99;
  config.physics.damping = 0.98;
  config.spawning.dissonanceRate = 0.1;
  config.spawning.amplifierRate = 0.2;
  config.rendering.backgroundColor = '#24273a';
  config.rendering.effects.screenShake = false;
  config.energy.decayRate = 0.05;
  
  return config;
}

/**
 * Crear configuración para modo Resonancia (enfocado en completar patrones)
 */
export function createResonanceConfig(): GameConfig {
  const config = createDefaultGameConfig();
  config.mode = GameMode.RESONANCE;
  config.physics.waveSpeed = 150;
  config.spawning.patternInterval = 15;
  config.spawning.initialResonators = 8;
  config.spawning.maxResonators = 15;
  config.rendering.backgroundColor = '#181825';
  config.energy.decayRate = 0.15;
  
  return config;
}

/**
 * Crear configuración para modo Equilibrio (enfocado en mantener balance energético)
 */
export function createBalanceConfig(): GameConfig {
  const config = createDefaultGameConfig();
  config.mode = GameMode.BALANCE;
  config.energy.imbalanceThreshold = 0.2;
  config.energy.imbalancePenalty = 8;
  config.energy.balanceBonus = 5;
  config.energy.decayRate = 0.2;
  config.spawning.dissonanceRate = 0.4;
  config.rendering.backgroundColor = '#11111b';
  
  return config;
}

/**
 * Alias para mantener compatibilidad con código existente
 */
export const createMeditationConfig = createHarmonyConfig;
