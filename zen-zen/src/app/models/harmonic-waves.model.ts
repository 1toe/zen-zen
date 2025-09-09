import { Position } from './player.model';
import { EnergyType } from './game-state.enum';

/**
 * Representa una onda armónica
 * Las ondas se propagan desde el núcleo y activan resonadores
 */
export interface HarmonicWave {
  /** Identificador único */
  id: string;
  
  /** Origen de la onda */
  origin: Position;
  
  /** Radio actual */
  radius: number;
  
  /** Radio máximo */
  maxRadius: number;
  
  /** Velocidad de propagación (unidades/s) */
  propagationSpeed: number;
  
  /** Amplitud de la onda (1.0 = normal) */
  amplitude: number;
  
  /** Tipo de energía */
  energyType: EnergyType;
  
  /** Opacidad (0-1) */
  opacity: number;
  
  /** Si está activa */
  isActive: boolean;
  
  /** Edad en ms */
  age: number;
  
  /** Tiempo de vida máximo en ms */
  maxLifeTime: number;
  
  /** IDs de resonadores que ha activado */
  activatedResonators: string[];
}

/**
 * Crea una onda armónica
 */
export function createHarmonicWave(
  origin: Position,
  config: {
    maxRadius: number;
    propagationSpeed: number;
    amplitude: number;
    energyType: EnergyType;
    maxLifeTime: number;
  }
): HarmonicWave {
  return {
    id: `wave-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    origin,
    radius: 0,
    maxRadius: config.maxRadius,
    propagationSpeed: config.propagationSpeed,
    amplitude: config.amplitude,
    energyType: config.energyType,
    opacity: 0.9,
    isActive: true,
    age: 0,
    maxLifeTime: config.maxLifeTime,
    activatedResonators: []
  };
}

/**
 * Representa una conexión entre resonadores
 */
export interface ResonatorConnection {
  /** Identificador único */
  id: string;
  
  /** IDs de los resonadores conectados */
  resonatorIds: string[];
  
  /** Tipo de energía */
  energyType: EnergyType;
  
  /** Si está activa */
  isActive: boolean;
  
  /** Intensidad (0-1) */
  intensity: number;
  
  /** Edad en ms */
  age: number;
  
  /** Duración en ms (-1 para permanente) */
  duration: number;
}

/**
 * Crea una conexión entre resonadores
 */
export function createResonatorConnection(
  resonatorIds: string[],
  energyType: EnergyType
): ResonatorConnection {
  return {
    id: `connection-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    resonatorIds,
    energyType,
    isActive: true,
    intensity: 0.8,
    age: 0,
    duration: -1 // Conexión permanente
  };
}

/**
 * Representa un patrón armónico formado por resonadores
 */
export interface HarmonicPattern {
  /** Identificador único */
  id: string;
  
  /** Nombre del patrón */
  name: string;
  
  /** Descripción */
  description: string;
  
  /** IDs de los resonadores que forman el patrón */
  resonatorIds: string[];
  
  /** IDs de las conexiones que forman el patrón */
  connectionIds: string[];
  
  /** Tipo de energía dominante */
  dominantEnergyType: EnergyType;
  
  /** Valor/puntuación del patrón */
  value: number;
  
  /** Efecto del patrón */
  effect: string;
  
  /** Momento de creación */
  createdAt: number;
  
  /** Si el patrón está completo (todas las conexiones activas) */
  isComplete: boolean;
  
  /** Tiempo que ha estado activo el patrón (ms) */
  activeTime: number;
}

/**
 * Crea un patrón armónico
 */
export function createHarmonicPattern(
  name: string,
  resonatorIds: string[],
  connectionIds: string[],
  dominantEnergyType: EnergyType,
  properties?: {
    description?: string;
    effect?: string;
    value?: number;
  }
): HarmonicPattern {
  return {
    id: `pattern-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    description: properties?.description || `Un patrón de ${resonatorIds.length} resonadores`,
    resonatorIds,
    connectionIds,
    dominantEnergyType,
    value: properties?.value || resonatorIds.length * 10,
    effect: properties?.effect || 'Mejora la armonía del sistema',
    createdAt: Date.now(),
    isComplete: true,
    activeTime: 0
  };
}
