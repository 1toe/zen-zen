import { Position } from './player.model';
import { EnergyType } from './game-state.enum';

/**
 * Modelo de onda armónica generada por el núcleo
 * Estas ondas se propagan por el espacio y pueden interactuar con resonadores
 */
export interface HarmonicWave {
  /** Identificador único de la onda */
  id: string;
  
  /** Posición de origen (generalmente el núcleo) */
  origin: Position;
  
  /** Posición actual del frente de onda */
  position: Position;
  
  /** Radio actual de la onda */
  radius: number;
  
  /** Radio máximo que alcanzará la onda */
  maxRadius: number;
  
  /** Velocidad de propagación (unidades/segundo) */
  propagationSpeed: number;
  
  /** Amplitud de la onda (fuerza/intensidad) */
  amplitude: number;
  
  /** Frecuencia de la onda */
  frequency: number;
  
  /** Tipo de energía de la onda */
  energyType: EnergyType;
  
  /** Tiempo de vida actual en milisegundos */
  age: number;
  
  /** Tiempo de vida máximo en milisegundos */
  maxLifeTime: number;
  
  /** Si la onda está activa */
  isActive: boolean;
  
  /** Opacidad actual (0-1) */
  opacity: number;
  
  /** Color base de la onda en formato hex */
  color: string;
  
  /** Resonadores que ha activado esta onda */
  activatedResonators: string[];
}

/**
 * Factory para crear una onda armónica con valores por defecto
 */
export function createHarmonicWave(
  origin: Position,
  energyType: EnergyType,
  overrides: Partial<HarmonicWave> = {}
): HarmonicWave {
  // Mapa de colores por tipo de energía
  const colorMap: Record<EnergyType, string> = {
    [EnergyType.CALM]: '#4ecdc4',     // Turquesa/azul
    [EnergyType.VIBRANT]: '#a8e6cf',  // Verde claro
    [EnergyType.INTENSE]: '#ff8c94',  // Rojo/rosa suave
    [EnergyType.HARMONIC]: '#c5a3ff'  // Púrpura
  };
  
  return {
    id: crypto.randomUUID(),
    origin: { ...origin },
    position: { ...origin },
    radius: 0,
    maxRadius: 250,
    propagationSpeed: 100, // unidades por segundo
    amplitude: 1.0,
    frequency: 1.0,
    energyType,
    age: 0,
    maxLifeTime: 3000, // 3 segundos
    isActive: true,
    opacity: 0.8,
    color: colorMap[energyType],
    activatedResonators: [],
    ...overrides
  };
}

/**
 * Modelo para una conexión entre resonadores
 * Representa un vínculo energético entre dos o más resonadores
 */
export interface ResonatorConnection {
  /** Identificador único de la conexión */
  id: string;
  
  /** IDs de los resonadores conectados */
  resonatorIds: string[];
  
  /** Tipo de energía de la conexión */
  energyType: EnergyType;
  
  /** Intensidad de la conexión (0-1) */
  intensity: number;
  
  /** Duración en milisegundos (-1 para permanente) */
  duration: number;
  
  /** Tiempo transcurrido desde su creación */
  age: number;
  
  /** Si la conexión está activa */
  isActive: boolean;
  
  /** Puntos que otorga esta conexión */
  scoreValue: number;
  
  /** Opacidad (0-1) */
  opacity: number;
  
  /** Color de la conexión */
  color: string;
  
  /** Ancho de la línea de conexión */
  width: number;
}

/**
 * Factory para crear una conexión entre resonadores
 */
export function createResonatorConnection(
  resonatorIds: string[],
  energyType: EnergyType,
  overrides: Partial<ResonatorConnection> = {}
): ResonatorConnection {
  // Mapa de colores por tipo de energía
  const colorMap: Record<EnergyType, string> = {
    [EnergyType.CALM]: '#4ecdc4',     // Turquesa/azul
    [EnergyType.VIBRANT]: '#a8e6cf',  // Verde claro
    [EnergyType.INTENSE]: '#ff8c94',  // Rojo/rosa suave
    [EnergyType.HARMONIC]: '#c5a3ff'  // Púrpura
  };
  
  return {
    id: crypto.randomUUID(),
    resonatorIds,
    energyType,
    intensity: 0.8,
    duration: -1, // Permanente por defecto
    age: 0,
    isActive: true,
    scoreValue: resonatorIds.length * 10,
    opacity: 0.7,
    color: colorMap[energyType],
    width: 3,
    ...overrides
  };
}

/**
 * Patrón armónico - un conjunto de resonadores conectados
 * que forman un patrón reconocible y otorgan bonificaciones
 */
export interface HarmonicPattern {
  /** Identificador único del patrón */
  id: string;
  
  /** Nombre del patrón */
  name: string;
  
  /** IDs de los resonadores que componen el patrón */
  resonatorIds: string[];
  
  /** IDs de las conexiones que forman el patrón */
  connectionIds: string[];
  
  /** Si el patrón está completo/activado */
  isComplete: boolean;
  
  /** Tipo de energía dominante en el patrón */
  dominantEnergyType: EnergyType;
  
  /** Valor en puntos del patrón completo */
  value: number;
  
  /** Tiempo que lleva activo */
  activeTime: number;
  
  /** Efecto especial que proporciona al completarse */
  effect?: string;
  
  /** Descripción del patrón */
  description: string;
}

/**
 * Factory para crear un patrón armónico
 */
export function createHarmonicPattern(
  name: string,
  resonatorIds: string[],
  connectionIds: string[],
  dominantEnergyType: EnergyType,
  overrides: Partial<HarmonicPattern> = {}
): HarmonicPattern {
  return {
    id: crypto.randomUUID(),
    name,
    resonatorIds,
    connectionIds,
    isComplete: false,
    dominantEnergyType,
    value: resonatorIds.length * 25,
    activeTime: 0,
    description: `Patrón de ${resonatorIds.length} resonadores`,
    ...overrides
  };
}
