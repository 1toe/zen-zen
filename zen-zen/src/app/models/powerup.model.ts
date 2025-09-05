import { Position } from './player.model';

/**
 * Tipos de power-ups disponibles en Zen Flow
 */
export type PowerUpType = 'energy' | 'score' | 'shield' | 'zen' | 'multipler';

/**
 * Efectos visuales de power-ups
 */
export type PowerUpEffect = 'glow' | 'pulse' | 'sparkle' | 'aura';

/**
 * Modelo de power-up en Zen Flow
 * Los power-ups restauran energía y otorgan beneficios zen
 */
export interface PowerUp {
  /** Identificador único del power-up */
  id: string;
  
  /** Tipo de power-up que determina su efecto */
  type: PowerUpType;
  
  /** Posición actual en el canvas */
  position: Position;
  
  /** Valor numérico del efecto (energía, puntos, etc.) */
  value: number;
  
  /** Duración del efecto en milisegundos (para efectos temporales) */
  duration?: number;
  
  /** Radio para detección de colisiones */
  radius: number;
  
  /** Color del power-up en formato hex */
  color: string;
  
  /** Efecto visual del power-up */
  effect: PowerUpEffect;
  
  /** Opacidad del power-up (0-1) */
  opacity: number;
  
  /** Tiempo de vida en el canvas antes de desaparecer */
  lifeTime: number;
  
  /** Tiempo transcurrido desde su creación */
  age: number;
  
  /** Si el power-up está activo y puede ser recogido */
  isActive: boolean;
  
  /** Velocidad de animación/pulsación */
  animationSpeed: number;
}

/**
 * Factory para crear un power-up con valores por defecto
 */
export function createPowerUp(type: PowerUpType, position: Position, overrides: Partial<PowerUp> = {}): PowerUp {
  const baseConfig = getPowerUpConfig(type);
  
  return {
    id: crypto.randomUUID(),
    type,
    position,
    value: 10, // Valor por defecto
    radius: 10, // Radio por defecto
    color: '#ffffff', // Color por defecto
    effect: 'glow' as PowerUpEffect, // Efecto por defecto
    opacity: 0.8, // Opacidad por defecto
    lifeTime: 5000, // Tiempo de vida por defecto
    age: 0,
    isActive: true,
    animationSpeed: 0.05,
    ...baseConfig,
    ...overrides
  };
}

/**
 * Configuración base para cada tipo de power-up
 */
function getPowerUpConfig(type: PowerUpType): Partial<PowerUp> {
  switch (type) {
    case 'energy':
      return {
        value: 20,
        radius: 12,
        color: '#4ecdc4',
        effect: 'glow',
        opacity: 0.9,
        lifeTime: 8000
      };
    
    case 'score':
      return {
        value: 50,
        radius: 10,
        color: '#ffd93d',
        effect: 'sparkle',
        opacity: 0.95,
        lifeTime: 6000
      };
    
    case 'shield':
      return {
        value: 1,
        duration: 5000,
        radius: 14,
        color: '#6c5ce7',
        effect: 'aura',
        opacity: 0.85,
        lifeTime: 10000
      };
    
    case 'zen':
      return {
        value: 0.1, // 10% de progreso zen
        radius: 16,
        color: '#a8e6cf',
        effect: 'pulse',
        opacity: 0.8,
        lifeTime: 12000
      };
    
    case 'multipler':
      return {
        value: 2, // Multiplicador x2
        duration: 10000,
        radius: 13,
        color: '#ff8b94',
        effect: 'glow',
        opacity: 0.9,
        lifeTime: 7000
      };
    
    default:
      return {
        value: 10,
        radius: 10,
        color: '#ffffff',
        effect: 'glow',
        opacity: 0.8,
        lifeTime: 5000
      };
  }
}
