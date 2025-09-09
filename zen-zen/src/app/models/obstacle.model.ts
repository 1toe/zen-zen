import { Position, Size, Velocity } from './player.model';
import { EnergyType } from './game-state.enum';

/**
 * Tipos de disonancias disponibles en Zen Harmonics
 */
export type DissonanceType = 'static' | 'moving' | 'pulsating' | 'disruptive';

/**
 * Formas de las disonancias
 */
export type DissonanceShape = 'circle' | 'square' | 'triangle' | 'irregular' | 'rectangle' | 'ring';

/**
 * Modelo de disonancia (obstáculo) en Zen Harmonics
 * Las disonancias perturban la armonía y dificultan la conexión entre resonadores
 */
export interface Dissonance {
  /** Identificador único de la disonancia */
  id: string;
  
  /** Tipo de comportamiento de la disonancia */
  type: DissonanceType;
  
  /** Forma de la disonancia */
  shape: DissonanceShape;
  
  /** Posición actual en el canvas */
  position: Position;
  
  /** Tamaño de la disonancia */
  size: Size;
  
  /** Velocidad de movimiento (para disonancias móviles) */
  velocity?: Velocity;
  
  /** Tipo de energía que contrarresta esta disonancia */
  countersEnergy: EnergyType;
  
  /** Velocidad de rotación en radianes/frame (para disonancias rotativas) */
  rotationSpeed?: number;
  
  /** Ángulo de rotación actual en radianes */
  rotation: number;
  
  /** Disrupción que causa a la armonía (daño) */
  disruptionLevel: number;
  
  /** Radio para disonancias circulares o radio de colisión */
  radius?: number;
  
  /** Color de la disonancia en formato hex */
  color: string;
  
  /** Opacidad de la disonancia (0-1) */
  opacity: number;
  
  /** Frecuencia de pulsación para disonancias pulsantes */
  pulseFrequency?: number;
  
  /** Tiempo de vida de la disonancia (ms) */
  lifeTime?: number;
  
  /** Tiempo transcurrido desde su creación */
  age: number;
  
  /** Si la disonancia está activa */
  isActive: boolean;
  
  /** Afecta a la energía específica */
  affectsEnergyType?: EnergyType;
}

/**
 * Factory para crear una disonancia con valores por defecto
 */
export function createDissonance(overrides: Partial<Dissonance> = {}): Dissonance {
  return {
    id: crypto.randomUUID(),
    type: 'static',
    shape: 'circle',
    position: { x: 0, y: 0 },
    size: { width: 30, height: 30 },
    rotation: 0,
    disruptionLevel: 10,
    color: '#ff6b6b',
    opacity: 0.8,
    countersEnergy: EnergyType.CALM,
    age: 0,
    isActive: true,
    ...overrides
  };
}

/**
 * Modelo de resonador - elementos que deben ser conectados con ondas armónicas
 */
export interface Resonator {
  /** Identificador único del resonador */
  id: string;
  
  /** Posición en el canvas */
  position: Position;
  
  /** Radio del resonador */
  radius: number;
  
  /** Tipo de energía que requiere para activarse */
  energyType: EnergyType;
  
  /** Estado de activación */
  isActivated: boolean;
  
  /** Conexiones activas con otros resonadores */
  connections: string[];
  
  /** Color del resonador en formato hex */
  color: string;
  
  /** Brillo/intensidad (0-1) */
  intensity: number;
  
  /** Frecuencia de resonancia */
  frequency: number;
  
  /** Si está actualmente recibiendo energía */
  isReceivingEnergy: boolean;
}

/**
 * Factory para crear un resonador
 */
export function createResonator(position: Position, energyType: EnergyType, overrides: Partial<Resonator> = {}): Resonator {
  // Asignar color según el tipo de energía
  const colorMap: Record<EnergyType, string> = {
    [EnergyType.CALM]: '#4ecdc4',     // Turquesa/azul
    [EnergyType.VIBRANT]: '#a8e6cf',  // Verde claro
    [EnergyType.INTENSE]: '#ff8c94',  // Rojo/rosa suave
    [EnergyType.HARMONIC]: '#c5a3ff'  // Púrpura
  };
  
  return {
    id: crypto.randomUUID(),
    position,
    radius: 20,
    energyType,
    isActivated: false,
    connections: [],
    color: colorMap[energyType],
    intensity: 0.5,
    frequency: 1.0,
    isReceivingEnergy: false,
    ...overrides
  };
}

/**
 * Configuración para generar patrones de resonadores
 */
export interface ResonatorPattern {
  /** Tipo de patrón */
  type: 'circle' | 'grid' | 'mandala' | 'spiral';
  
  /** Número de resonadores en el patrón */
  count: number;
  
  /** Disposición de tipos de energía */
  energyTypes: EnergyType[];
  
  /** Radio base para patrones circulares */
  radius: number;
  
  /** Rotación del patrón completo en radianes */
  rotation: number;
}

/**
 * Alias para mantener compatibilidad con código existente
 */
export type Obstacle = Dissonance;
export const createObstacle = createDissonance;
