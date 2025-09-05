// Models exports
export * from './player.model';
export * from './obstacle.model';
export * from './powerup.model';
export * from './game-state.enum';
export * from './game-config.model';

// Utility types
export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * Información de colisión entre objetos
 */
export interface CollisionInfo {
  occurred: boolean;
  point?: Point;
  normal?: Point;
  penetration?: number;
}

/**
 * Evento del juego con datos asociados
 */
export interface GameEventData {
  type: string;
  timestamp: number;
  data?: any;
}
