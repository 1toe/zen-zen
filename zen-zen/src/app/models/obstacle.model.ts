import { Position, Size, Velocity } from './player.model';

/**
 * Tipos de obstáculos disponibles en Zen Flow
 */
export type ObstacleType = 'static' | 'moving' | 'rotating' | 'pulsing';

/**
 * Formas geométricas de obstáculos
 */
export type ObstacleShape = 'circle' | 'rectangle' | 'triangle' | 'ring';

/**
 * Modelo de obstáculo en Zen Flow
 * Los obstáculos aparecen en patrones concéntricos
 */
export interface Obstacle {
  /** Identificador único del obstáculo */
  id: string;
  
  /** Tipo de comportamiento del obstáculo */
  type: ObstacleType;
  
  /** Forma geométrica del obstáculo */
  shape: ObstacleShape;
  
  /** Posición actual en el canvas */
  position: Position;
  
  /** Tamaño del obstáculo */
  size: Size;
  
  /** Velocidad de movimiento (para obstáculos móviles) */
  velocity?: Velocity;
  
  /** Velocidad de rotación en radianes/frame (para obstáculos rotativos) */
  rotationSpeed?: number;
  
  /** Ángulo de rotación actual en radianes */
  rotation: number;
  
  /** Daño que causa al jugador al colisionar */
  damage: number;
  
  /** Radio para obstáculos circulares o radio de colisión */
  radius?: number;
  
  /** Color del obstáculo en formato hex */
  color: string;
  
  /** Opacidad del obstáculo (0-1) */
  opacity: number;
  
  /** Tiempo de vida del obstáculo (para obstáculos temporales) */
  lifeTime?: number;
  
  /** Si el obstáculo está activo */
  isActive: boolean;
}

/**
 * Factory para crear un obstáculo con valores por defecto
 */
export function createObstacle(overrides: Partial<Obstacle> = {}): Obstacle {
  return {
    id: crypto.randomUUID(),
    type: 'static',
    shape: 'rectangle',
    position: { x: 0, y: 0 },
    size: { width: 50, height: 50 },
    rotation: 0,
    damage: 10,
    color: '#ff6b6b',
    opacity: 0.8,
    isActive: true,
    ...overrides
  };
}

/**
 * Configuración para generar obstáculos en patrones
 */
export interface ObstaclePattern {
  /** Tipo de patrón */
  type: 'concentric' | 'spiral' | 'wave' | 'cluster';
  
  /** Número de obstáculos en el patrón */
  count: number;
  
  /** Radio base para patrones circulares */
  radius: number;
  
  /** Espaciado entre obstáculos */
  spacing: number;
  
  /** Velocidad del patrón */
  speed: number;
}
