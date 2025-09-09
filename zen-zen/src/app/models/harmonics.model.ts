import { Position } from './player.model';
import { EnergyType } from './game-state.enum';

/**
 * Representa un resonador armónico en el sistema
 * Los resonadores interactúan con las ondas armónicas y pueden formar patrones
 */
export interface HarmonicResonator {
  /** Identificador único del resonador */
  id: string;
  
  /** Posición del resonador */
  position: Position;
  
  /** Tipo de energía que puede canalizar */
  energyType: EnergyType;
  
  /** Radio del resonador */
  radius: number;
  
  /** Si está actualmente activado */
  isActive: boolean;
  
  /** Umbral de activación (0-1) */
  activationThreshold: number;
  
  /** Duración de la activación en ms */
  activationDuration: number;
  
  /** Último momento de activación */
  lastActivationTime: number;
  
  /** IDs de conexiones con otros resonadores */
  connections: string[];
  
  /** Energía actual */
  energy: number;
  
  /** Energía máxima */
  maxEnergy: number;
  
  /** Brillo actual (0-1) */
  brightness: number;
}

/**
 * Crea un resonador armónico con valores por defecto
 */
export function createHarmonicResonator(position: Position, energyType: EnergyType): HarmonicResonator {
  return {
    id: `resonator-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    position,
    energyType,
    radius: 15,
    isActive: false,
    activationThreshold: 0.3,
    activationDuration: 5000,
    lastActivationTime: 0,
    connections: [],
    energy: 0,
    maxEnergy: 100,
    brightness: 0.2
  };
}

/**
 * Núcleo armónico - centro energético del sistema
 */
export interface HarmonicCore {
  /** Posición del núcleo */
  position: Position;
  
  /** Velocidad actual */
  velocity: Position;
  
  /** Radio del núcleo */
  radius: number;
  
  /** Energía actual */
  energy: number;
  
  /** Energía máxima */
  maxEnergy: number;
  
  /** Nivel de armonía (1-10) */
  harmonyLevel: number;
  
  /** Frecuencia de resonancia (1.0 = normal) */
  frequency: number;
  
  /** Amplitud de ondas generadas (1.0 = normal) */
  amplitude: number;
  
  /** Balance de energías */
  energyBalance: {
    calm: number;
    vibrant: number;
    intense: number;
  };
  
  /** Brillo actual (0-1) */
  brightness: number;
  
  /** Si el núcleo está activo */
  isActive: boolean;
  
  /** Efectos activos actualmente */
  activeEffects: string[];
}

/**
 * Crea un núcleo armónico con valores por defecto
 */
export function createHarmonicCore(overrides: Partial<HarmonicCore> = {}): HarmonicCore {
  return {
    position: { x: 275, y: 275 },
    velocity: { x: 0, y: 0 },
    radius: 25,
    energy: 100,
    maxEnergy: 100,
    harmonyLevel: 1,
    frequency: 1.0,
    amplitude: 1.0,
    energyBalance: {
      calm: 33,
      vibrant: 33,
      intense: 34
    },
    brightness: 1.0,
    isActive: true,
    activeEffects: [],
    ...overrides
  };
}

/**
 * Disonancia - elemento perturbador que afecta negativamente al sistema
 */
export interface Dissonance {
  /** Identificador único */
  id: string;
  
  /** Posición */
  position: Position;
  
  /** Velocidad (para disonancias móviles) */
  velocity?: Position;
  
  /** Tipo de disonancia */
  type: 'static' | 'moving' | 'pulsating' | 'disruptive';
  
  /** Forma visual */
  shape: 'circle' | 'square' | 'triangle' | 'irregular' | 'rectangle' | 'ring';
  
  /** Radio o tamaño */
  radius?: number;
  
  /** Rotación en radianes */
  rotation?: number;
  
  /** Velocidad de rotación (radianes/s) */
  rotationSpeed?: number;
  
  /** Frecuencia de pulsación (para tipo pulsating) */
  pulseFrequency?: number;
  
  /** Tipo de energía que contrarresta */
  countersEnergy: EnergyType;
  
  /** Nivel de disrupción (daño al núcleo) */
  disruptionLevel: number;
  
  /** Color visual */
  color: string;
  
  /** Opacidad (0-1) */
  opacity: number;
  
  /** Si está activa */
  isActive: boolean;
  
  /** Edad en ms */
  age: number;
  
  /** Tiempo de vida máximo en ms */
  lifeTime?: number;
}

/**
 * Crea una disonancia con valores por defecto
 */
export function createDissonance(overrides: Partial<Dissonance> = {}): Dissonance {
  return {
    id: `dissonance-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    position: { x: 0, y: 0 },
    type: 'static',
    shape: 'circle',
    radius: 15,
    rotation: 0,
    countersEnergy: EnergyType.CALM,
    disruptionLevel: 10,
    color: '#ff6b6b',
    opacity: 0.8,
    isActive: true,
    age: 0,
    ...overrides
  };
}

/**
 * Amplificador de armonía - power-up que mejora el sistema
 */
export interface HarmonyAmplifier {
  /** Identificador único */
  id: string;
  
  /** Posición */
  position: Position;
  
  /** Tipo de amplificador */
  type: 'energy' | 'frequency' | 'amplitude' | 'resonance' | 
        'balance' | 'clarity' | 'expansion' | 'stability' |
        'zen' | 'multipler';
  
  /** Valor del amplificador */
  value: number;
  
  /** Radio visual */
  radius: number;
  
  /** Tipo de energía */
  energyType: EnergyType;
  
  /** Color visual */
  color: string;
  
  /** Opacidad (0-1) */
  opacity: number;
  
  /** Si está activo */
  isActive: boolean;
  
  /** Edad en ms */
  age: number;
  
  /** Tiempo de vida máximo en ms */
  lifeTime: number;
  
  /** Duración del efecto en ms */
  duration: number;
  
  /** Efecto del amplificador (para compatibilidad) */
  effect?: string;
  
  /** Velocidad de animación (para compatibilidad) */
  animationSpeed?: number;
  
  /** Descripción del amplificador (para compatibilidad) */
  description?: string;
}

/**
 * Crea un amplificador de armonía
 */
export function createHarmonyAmplifier(
  type: HarmonyAmplifier['type'], 
  position: Position, 
  energyType: EnergyType
): HarmonyAmplifier {
  // Mapa de colores por tipo de energía
  const colorMap: Record<EnergyType, string> = {
    [EnergyType.CALM]: '#4ecdc4',     // Turquesa/azul
    [EnergyType.VIBRANT]: '#a8e6cf',  // Verde claro
    [EnergyType.INTENSE]: '#ff8c94',  // Rojo/rosa suave
    [EnergyType.HARMONIC]: '#c5a3ff'  // Púrpura
  };
  
  // Mapa de valores por tipo de amplificador
  const valueMap: Record<HarmonyAmplifier['type'], number> = {
    energy: 25,
    frequency: 0.5,
    amplitude: 0.3,
    resonance: 0.4,
    balance: 0.6,
    clarity: 0.5,
    expansion: 0.3,
    stability: 0.7,
    zen: 50,
    multipler: 2
  };
  
  return {
    id: `amplifier-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    position,
    type,
    value: valueMap[type],
    radius: 15,
    energyType,
    color: colorMap[energyType],
    opacity: 0.9,
    isActive: true,
    age: 0,
    lifeTime: 10000, // 10 segundos de vida
    duration: 5000,  // 5 segundos de efecto
    // Propiedades para compatibilidad
    effect: 'glow',
    animationSpeed: 1.0,
    description: `Amplifica el núcleo con energía ${energyType}`
  };
}
