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
 * Modelo del jugador en Zen Flow
 * El jugador es una esfera luminosa que progresa hacia el centro zen
 */
export interface Player {
  /** Identificador único del jugador */
  id: string;
  
  /** Posición actual en el canvas */
  position: Position;
  
  /** Velocidad de movimiento */
  velocity: Velocity;
  
  /** Energía actual del jugador */
  energy: number;
  
  /** Energía máxima del jugador */
  maxEnergy: number;
  
  /** Radio de la esfera del jugador para colisiones */
  radius: number;
  
  /** Estado de vida del jugador */
  isAlive: boolean;
  
  /** Puntuación actual */
  score: number;
  
  /** Nivel actual del jugador */
  level: number;
  
  /** Progreso hacia el centro zen (0-1) */
  zenProgress: number;
}

/**
 * Factory para crear un jugador con valores por defecto
 */
export function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: crypto.randomUUID(),
    position: { x: 50, y: 250 }, // Posición inicial izquierda-centro
    velocity: { x: 0, y: 0 },
    energy: 100,
    maxEnergy: 100,
    radius: 15,
    isAlive: true,
    score: 0,
    level: 1,
    zenProgress: 0,
    ...overrides
  };
}
