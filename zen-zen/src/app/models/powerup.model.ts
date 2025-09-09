import { Position } from './player.model';
import { EnergyType } from './game-state.enum';

/**
 * Tipos de amplificadores de armonía disponibles
 */
export type HarmonyAmplifierType = 
  | 'energy'       // Restaura energía al núcleo
  | 'frequency'    // Aumenta la frecuencia de ondas generadas
  | 'amplitude'    // Aumenta la amplitud de ondas
  | 'resonance'    // Mejora la conexión con resonadores
  | 'balance'      // Mejora el balance energético
  | 'clarity'      // Reduce el efecto de disonancias
  | 'expansion'    // Expande el alcance de las ondas
  | 'stability'    // Estabiliza el núcleo y las ondas
  | 'zen'          // Power-up especial para compatibilidad
  | 'multipler';   // Power-up especial para compatibilidad

/**
 * Efectos visuales de amplificadores
 */
export type AmplifierEffect = 'glow' | 'pulse' | 'sparkle' | 'aura' | 'ripple' | string;

/**
 * Modelo de amplificador de armonía (power-up) en Zen Harmonics
 * Los amplificadores potencian diferentes aspectos del núcleo armónico
 */
export interface HarmonyAmplifier {
  /** Identificador único del amplificador */
  id: string;
  
  /** Tipo de amplificador que determina su efecto */
  type: HarmonyAmplifierType;
  
  /** Tipo de energía que este amplificador refuerza */
  energyType: EnergyType;
  
  /** Posición actual en el canvas */
  position: Position;
  
  /** Valor numérico del efecto */
  value: number;
  
  /** Duración del efecto en milisegundos */
  duration: number;
  
  /** Radio para detección de colisiones */
  radius: number;
  
  /** Color del amplificador en formato hex */
  color: string;
  
  /** Efecto visual */
  effect: string;
  
  /** Opacidad (0-1) */
  opacity: number;
  
  /** Tiempo de vida en el canvas antes de desaparecer */
  lifeTime: number;
  
  /** Tiempo transcurrido desde su creación */
  age: number;
  
  /** Si está activo y puede ser recogido */
  isActive: boolean;
  
  /** Velocidad de animación/pulsación */
  animationSpeed: number;
  
  /** Frecuencia de vibración */
  vibrationFrequency?: number;
  
  /** Descripción del efecto para mostrar al usuario */
  description: string;
}

/**
 * Factory para crear un amplificador de armonía con valores por defecto
 */
export function createHarmonyAmplifier(
  type: HarmonyAmplifierType, 
  position: Position, 
  energyType: EnergyType = EnergyType.HARMONIC,
  overrides: Partial<HarmonyAmplifier> = {}
): HarmonyAmplifier {
  const baseConfig = getAmplifierConfig(type, energyType);
  
  return {
    id: crypto.randomUUID(),
    type,
    energyType,
    position,
    value: 10, // Valor por defecto
    duration: 10000, // 10 segundos por defecto
    radius: 15, // Radio por defecto
    color: '#ffffff', // Color por defecto
    effect: 'glow' as AmplifierEffect, // Efecto por defecto
    opacity: 0.8, // Opacidad por defecto
    lifeTime: 8000, // Tiempo de vida por defecto
    age: 0,
    isActive: true,
    animationSpeed: 0.05,
    description: 'Amplificador de armonía',
    ...baseConfig,
    ...overrides
  };
}

/**
 * Configuración base para cada tipo de amplificador
 */
function getAmplifierConfig(type: HarmonyAmplifierType, energyType: EnergyType): Partial<HarmonyAmplifier> {
  // Mapa de colores base por tipo de energía
  const energyColorMap: Record<EnergyType, string> = {
    [EnergyType.CALM]: '#4ecdc4',     // Turquesa/azul
    [EnergyType.VIBRANT]: '#a8e6cf',  // Verde claro
    [EnergyType.INTENSE]: '#ff8c94',  // Rojo/rosa suave
    [EnergyType.HARMONIC]: '#c5a3ff'  // Púrpura
  };
  
  const baseColor = energyColorMap[energyType];
  
  switch (type) {
    case 'energy':
      return {
        value: 25,
        radius: 12,
        color: baseColor,
        effect: 'glow',
        opacity: 0.9,
        lifeTime: 8000,
        description: 'Restaura energía al núcleo armónico'
      };
    
    case 'frequency':
      return {
        value: 0.5, // Aumenta frecuencia en 0.5
        duration: 15000,
        radius: 14,
        color: '#7bcdba',
        effect: 'pulse',
        opacity: 0.85,
        lifeTime: 10000,
        description: 'Aumenta la frecuencia de ondas generadas'
      };
    
    case 'amplitude':
      return {
        value: 0.5, // Aumenta amplitud en 0.5
        duration: 12000,
        radius: 16,
        color: '#ffd3b6',
        effect: 'ripple',
        opacity: 0.8,
        lifeTime: 9000,
        description: 'Amplifica la intensidad de tus ondas'
      };
    
    case 'resonance':
      return {
        value: 2.0, // Duplica la fuerza de resonancia
        duration: 20000,
        radius: 18,
        color: '#a8e6cf',
        effect: 'sparkle',
        opacity: 0.9,
        lifeTime: 12000,
        description: 'Mejora la conexión con los resonadores'
      };
    
    case 'balance':
      return {
        value: 0.3, // Mejora el balance en un 30%
        duration: 25000,
        radius: 15,
        color: '#c5a3ff',
        effect: 'aura',
        opacity: 0.85,
        lifeTime: 15000,
        description: 'Equilibra los tipos de energía'
      };
    
    case 'clarity':
      return {
        value: 0.5, // Reduce el efecto de disonancias en un 50%
        duration: 18000,
        radius: 17,
        color: '#dcedc1',
        effect: 'glow',
        opacity: 0.75,
        lifeTime: 10000,
        description: 'Reduce el efecto de las disonancias'
      };
    
    case 'expansion':
      return {
        value: 1.5, // Aumenta el alcance en un 50%
        duration: 15000,
        radius: 20,
        color: '#ffaaa5',
        effect: 'pulse',
        opacity: 0.8,
        lifeTime: 12000,
        description: 'Expande el alcance de tus ondas'
      };
    
    case 'stability':
      return {
        value: 0.7, // Reduce variaciones en un 70%
        duration: 30000,
        radius: 16,
        color: '#fff2a0',
        effect: 'aura',
        opacity: 0.85,
        lifeTime: 15000,
        description: 'Estabiliza el núcleo y las ondas'
      };
    
    default:
      return {
        color: baseColor,
        effect: 'glow',
        description: 'Amplificador de armonía'
      };
  }
}

/**
 * Alias para mantener compatibilidad con código existente
 */
export type PowerUp = HarmonyAmplifier;
export const createPowerUp = createHarmonyAmplifier;
