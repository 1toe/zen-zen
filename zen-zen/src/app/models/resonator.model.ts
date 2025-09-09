import { Position } from './player.model';
import { EnergyType } from './game-state.enum';

/**
 * Modelo de resonador
 * Los resonadores son puntos de amplificación armónica en el espacio
 * que pueden ser activados por ondas y conectarse entre sí
 */
export interface Resonator {
  /** Identificador único del resonador */
  id: string;
  
  /** Posición en el canvas */
  position: Position;
  
  /** Tipo de energía del resonador */
  energyType: EnergyType;
  
  /** Radio del resonador */
  radius: number;
  
  /** Si está activado por alguna onda armónica */
  isActivated: boolean;
  
  /** Si está recibiendo energía en este momento */
  isReceivingEnergy: boolean;
  
  /** Intensidad actual (0-1) */
  intensity: number;
  
  /** Tiempo que lleva activado (ms) */
  activationTime: number;
  
  /** Color del resonador en formato hex */
  color: string;
  
  /** Rotación en radianes */
  rotation: number;
  
  /** Velocidad de rotación (radianes/segundo) */
  rotationSpeed: number;
  
  /** Frecuencia de pulso (Hz) */
  pulseFrequency: number;
  
  /** Efectos visuales activos */
  effects: string[];
  
  /** IDs de las conexiones con otros resonadores */
  connections: string[];
}

/**
 * Factory para crear un resonador con valores por defecto
 */
export function createResonator(
  position: Position,
  energyType: EnergyType,
  overrides: Partial<Resonator> = {}
): Resonator {
  // Mapa de colores por tipo de energía
  const colorMap: Record<EnergyType, string> = {
    [EnergyType.CALM]: '#4ecdc4',     // Turquesa/azul
    [EnergyType.VIBRANT]: '#a8e6cf',  // Verde claro
    [EnergyType.INTENSE]: '#ff8c94',  // Rojo/rosa suave
    [EnergyType.HARMONIC]: '#c5a3ff'  // Púrpura
  };
  
  return {
    id: crypto.randomUUID(),
    position,
    energyType,
    radius: 12,
    isActivated: false,
    isReceivingEnergy: false,
    intensity: 0.3,
    activationTime: 0,
    color: colorMap[energyType],
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: 0.2 + Math.random() * 0.3,
    pulseFrequency: 0.5 + Math.random() * 1.5,
    effects: [],
    connections: [],
    ...overrides
  };
}

/**
 * Modelo de conexión entre resonadores
 * Las conexiones forman la base de los patrones armónicos
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
  
  /** Si la conexión está activa */
  isActive: boolean;
  
  /** Tiempo transcurrido desde su creación (ms) */
  age: number;
  
  /** Duración de la conexión (ms, -1 para infinito) */
  duration: number;
  
  /** Ancho de la línea de conexión */
  width: number;
}

/**
 * Factory para crear una conexión con valores por defecto
 */
export function createResonatorConnection(
  resonatorIds: string[],
  energyType: EnergyType,
  overrides: Partial<ResonatorConnection> = {}
): ResonatorConnection {
  return {
    id: crypto.randomUUID(),
    resonatorIds,
    energyType,
    intensity: 0.8,
    isActive: true,
    age: 0,
    duration: -1, // Infinito por defecto
    width: 2,
    ...overrides
  };
}

/**
 * Modelo de patrón armónico
 * Los patrones se forman al conectar resonadores en formas específicas
 */
export interface HarmonicPattern {
  /** Identificador único del patrón */
  id: string;
  
  /** Nombre descriptivo del patrón */
  name: string;
  
  /** IDs de los resonadores que forman el patrón */
  resonatorIds: string[];
  
  /** IDs de las conexiones que forman el patrón */
  connectionIds: string[];
  
  /** Tipo de energía dominante del patrón */
  dominantEnergyType: EnergyType;
  
  /** Si el patrón está completo y activado */
  isComplete: boolean;
  
  /** Tiempo que lleva activo (ms) */
  activeTime: number;
  
  /** Valor del patrón (puntos) */
  value: number;
  
  /** Nivel de complejidad del patrón (1-10) */
  complexity: number;
  
  /** Forma geométrica que describe el patrón */
  shape: string;
}

/**
 * Factory para crear un patrón armónico con valores por defecto
 */
export function createHarmonicPattern(
  name: string,
  resonatorIds: string[],
  connectionIds: string[],
  dominantEnergyType: EnergyType,
  overrides: Partial<HarmonicPattern> = {}
): HarmonicPattern {
  // El valor base depende del número de conexiones
  const baseValue = resonatorIds.length * 10;
  // La complejidad depende del número de resonadores
  const complexity = Math.min(10, Math.ceil(resonatorIds.length / 2));
  
  return {
    id: crypto.randomUUID(),
    name,
    resonatorIds,
    connectionIds,
    dominantEnergyType,
    isComplete: true,
    activeTime: 0,
    value: baseValue,
    complexity,
    shape: determinePatternShape(resonatorIds.length),
    ...overrides
  };
}

/**
 * Determina la forma del patrón según el número de resonadores
 */
function determinePatternShape(resonatorCount: number): string {
  switch (resonatorCount) {
    case 3: return 'triangle';
    case 4: return 'square';
    case 5: return 'pentagon';
    case 6: return 'hexagon';
    case 7: return 'heptagon';
    case 8: return 'octagon';
    default: return resonatorCount > 8 ? 'complex' : 'line';
  }
}

/**
 * Modelo de onda armónica
 * Las ondas se propagan desde el núcleo y activan resonadores
 */
export interface HarmonicWave {
  /** Identificador único de la onda */
  id: string;
  
  /** Origen de la onda */
  origin: Position;
  
  /** Tipo de energía de la onda */
  energyType: EnergyType;
  
  /** Radio actual de la onda */
  radius: number;
  
  /** Radio máximo que alcanzará la onda */
  maxRadius: number;
  
  /** Velocidad de propagación (unidades/segundo) */
  propagationSpeed: number;
  
  /** Si la onda está activa */
  isActive: boolean;
  
  /** Tiempo transcurrido desde su creación (ms) */
  age: number;
  
  /** Tiempo máximo de vida (ms) */
  maxLifeTime: number;
  
  /** Intensidad/opacidad de la onda (0-1) */
  opacity: number;
  
  /** Color de la onda */
  color: string;
  
  /** Grosor de la línea de la onda */
  thickness: number;
  
  /** IDs de resonadores que ha activado */
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
    origin,
    energyType,
    radius: 0,
    maxRadius: 250,
    propagationSpeed: 150,
    isActive: true,
    age: 0,
    maxLifeTime: 3000, // 3 segundos
    opacity: 0.7,
    color: colorMap[energyType],
    thickness: 2,
    activatedResonators: [],
    ...overrides
  };
}
