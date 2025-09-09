/**
 * Representa la posición 2D en el canvas
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Representa la velocidad o vector de movimiento 2D
 */
export interface Velocity {
  x: number;
  y: number;
}

/**
 * Representa las dimensiones de un objeto 2D
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Representa el balance energético del núcleo
 */
export interface EnergyBalance {
  calm: number;     // Energía de calma (0-100)
  vibrant: number;  // Energía de vibración (0-100)
  intense: number;  // Energía de intensidad (0-100)
}

/**
 * Modelo del núcleo armónico (player) en Zen Harmonics
 * El núcleo es el elemento central que genera ondas y conecta resonadores
 */
export interface HarmonicCore {
  /** Identificador único del núcleo */
  id: string;
  
  /** Posición actual en el canvas */
  position: Position;
  
  /** Velocidad de movimiento */
  velocity: Velocity;
  
  /** Energía actual del núcleo */
  energy: number;
  
  /** Energía máxima del núcleo */
  maxEnergy: number;
  
  /** Radio del núcleo para colisiones y visualización */
  radius: number;
  
  /** Estado de vida del núcleo */
  isActive: boolean;
  
  /** Puntuación actual */
  score: number;
  
  /** Nivel de armonía alcanzado */
  harmonyLevel: number;
  
  /** Balance entre diferentes tipos de energía */
  energyBalance: EnergyBalance;
  
  /** Frecuencia de ondas generadas (ondas/segundo) */
  frequency: number;
  
  /** Amplitud de las ondas generadas */
  amplitude: number;
  
  /** Color principal del núcleo en formato hex */
  color: string;
  
  /** Nivel de brillo del núcleo (0-1) */
  brightness: number;
  
  /** Patrones completados en la sesión actual */
  completedPatterns: number;
  
  /** Efectos activos en el núcleo */
  activeEffects: string[];
}

/**
 * Factory para crear un núcleo armónico con valores por defecto
 */
export function createHarmonicCore(overrides: Partial<HarmonicCore> = {}): HarmonicCore {
  return {
    id: crypto.randomUUID(),
    position: { x: 275, y: 275 }, // Posición inicial centro
    velocity: { x: 0, y: 0 },
    energy: 100,
    maxEnergy: 100,
    radius: 15,
    isActive: true,
    score: 0,
    harmonyLevel: 1,
    energyBalance: {
      calm: 33,
      vibrant: 33,
      intense: 34
    },
    frequency: 1.0,
    amplitude: 1.0,
    color: '#4ecdc4',
    brightness: 0.8,
    completedPatterns: 0,
    activeEffects: [],
    ...overrides
  };
}

/**
 * Alias para mantener compatibilidad con código existente
 */
export type Player = HarmonicCore;
export const createPlayer = createHarmonicCore;
