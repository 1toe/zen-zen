import { Injectable, signal, computed, inject } from '@angular/core';
import { 
  HarmonicWave, 
  createHarmonicWave, 
  Resonator, 
  createResonator, 
  ResonatorConnection, 
  createResonatorConnection,
  HarmonicPattern,
  createHarmonicPattern,
  Position,
  GameConfig,
  EnergyType
} from '../models';
import { GameEngineService } from './game-engine.service';

/**
 * Servicio para gestionar el sistema de resonadores y ondas armónicas
 * Se encarga de crear, actualizar y gestionar las interacciones entre
 * el núcleo armónico, las ondas generadas y los resonadores
 */
@Injectable({
  providedIn: 'root'
})
export class HarmonicSystemService {
  private gameEngine = inject(GameEngineService);
  
  // Estado del sistema usando signals
  private _harmonicWaves = signal<HarmonicWave[]>([]);
  private _resonators = signal<Resonator[]>([]);
  private _connections = signal<ResonatorConnection[]>([]);
  private _patterns = signal<HarmonicPattern[]>([]);
  
  // Signals públicos (read-only)
  public readonly harmonicWaves = this._harmonicWaves.asReadonly();
  public readonly resonators = this._resonators.asReadonly();
  public readonly connections = this._connections.asReadonly();
  public readonly patterns = this._patterns.asReadonly();
  
  // Computed signals
  public readonly activeWaves = computed(() => 
    this._harmonicWaves().filter(wave => wave.isActive)
  );
  
  public readonly activeResonators = computed(() => 
    this._resonators().filter(resonator => resonator.isActivated)
  );
  
  public readonly activePatterns = computed(() => 
    this._patterns().filter(pattern => pattern.isComplete)
  );
  
  public readonly totalActiveConnections = computed(() => 
    this._connections().filter(conn => conn.isActive).length
  );
  
  constructor() {}
  
  /**
   * Inicializa el sistema armónico con la configuración del juego
   */
  public initializeSystem(config: GameConfig): void {
    this.clearSystem();
    this.generateInitialResonators(config);
  }
  
  /**
   * Limpia todo el sistema (reinicia)
   */
  public clearSystem(): void {
    this._harmonicWaves.set([]);
    this._resonators.set([]);
    this._connections.set([]);
    this._patterns.set([]);
  }
  
  /**
   * Actualiza todo el sistema (bucle principal)
   * @param deltaTime Tiempo transcurrido desde el último frame en segundos
   */
  public updateSystem(deltaTime: number): void {
    this.updateHarmonicWaves(deltaTime);
    this.updateResonators(deltaTime);
    this.updateConnections(deltaTime);
    this.updatePatterns(deltaTime);
    this.checkForNewPatterns();
  }
  
  /**
   * Genera una nueva onda armónica desde la posición especificada
   */
  public generateHarmonicWave(
    origin: Position, 
    energyType: EnergyType, 
    overrides: Partial<HarmonicWave> = {}
  ): HarmonicWave {
    const config = {
      maxRadius: 200,
      propagationSpeed: 100,
      amplitude: 1.0,
      energyType,
      maxLifeTime: 3000,
      ...overrides
    };
    
    const wave = createHarmonicWave(origin, config);
    
    this._harmonicWaves.update(waves => [...waves, wave]);
    
    return wave;
  }
  
  /**
   * Genera resonadores iniciales según la configuración
   */
  private generateInitialResonators(config: GameConfig): void {
    const { initialResonators } = config.spawning;
    const { canvasSize } = config.rendering;
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const newResonators: Resonator[] = [];
    
    // Generar resonadores en círculo alrededor del centro
    for (let i = 0; i < initialResonators; i++) {
      const angle = (i / initialResonators) * Math.PI * 2;
      const radius = 150; // Distancia desde el centro
      
      const position = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
      
      // Asignar tipo de energía de forma balanceada
      const energyIndex = i % 3;
      const energyType = energyIndex === 0 
        ? EnergyType.CALM 
        : energyIndex === 1 
          ? EnergyType.VIBRANT 
          : EnergyType.INTENSE;
      
      const resonator = createResonator(position, energyType);
      newResonators.push(resonator);
    }
    
    this._resonators.set(newResonators);
  }
  
  /**
   * Actualiza el estado de todas las ondas armónicas
   */
  private updateHarmonicWaves(deltaTime: number): void {
    this._harmonicWaves.update(waves => {
      return waves
        .map(wave => this.updateWave(wave, deltaTime))
        .filter(wave => wave.isActive && wave.age < wave.maxLifeTime);
    });
  }
  
  /**
   * Actualiza una onda individual
   */
  private updateWave(wave: HarmonicWave, deltaTime: number): HarmonicWave {
    // Actualizar edad
    const age = wave.age + deltaTime * 1000; // convertir a ms
    
    // Actualizar radio según velocidad de propagación
    const radius = wave.radius + (wave.propagationSpeed * deltaTime);
    
    // Reducir opacidad con el tiempo
    const opacityFactor = 1 - (age / wave.maxLifeTime);
    const opacity = wave.opacity * opacityFactor;
    
    // Comprobar si la onda ha alcanzado su radio máximo
    const isActive = radius <= wave.maxRadius && age <= wave.maxLifeTime;
    
    // Comprobar si la onda está activando nuevos resonadores
    const activatedResonators = [...wave.activatedResonators];
    if (isActive) {
      this._resonators().forEach(resonator => {
        // Si ya está activado por esta onda, omitir
        if (activatedResonators.includes(resonator.id)) {
          return;
        }
        
        // Calcular distancia entre onda y resonador
        const dx = resonator.position.x - wave.origin.x;
        const dy = resonator.position.y - wave.origin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si la distancia está cerca del radio actual (dentro de un margen)
        const margin = 10;
        if (Math.abs(distance - radius) < margin) {
          // Si el tipo de energía coincide, activar el resonador
          if (resonator.energyType === wave.energyType) {
            this.activateResonator(resonator.id);
            activatedResonators.push(resonator.id);
          }
        }
      });
    }
    
    return {
      ...wave,
      radius,
      age,
      opacity,
      isActive,
      activatedResonators
    };
  }
  
  /**
   * Actualiza el estado de todos los resonadores
   */
  private updateResonators(deltaTime: number): void {
    this._resonators.update(resonators => {
      return resonators.map(resonator => {
        // Comprobar si alguna onda está pasando por el resonador
        const isReceivingEnergy = this._harmonicWaves().some(wave => {
          if (!wave.isActive || wave.energyType !== resonator.energyType) {
            return false;
          }
          
          const dx = resonator.position.x - wave.origin.x;
          const dy = resonator.position.y - wave.origin.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Si la distancia está cerca del radio actual (dentro de un margen)
          const margin = resonator.radius;
          return Math.abs(distance - wave.radius) < margin;
        });
        
        // Ajustar intensidad según si está recibiendo energía
        let intensity = resonator.intensity;
        if (isReceivingEnergy) {
          intensity = Math.min(1.0, intensity + 0.1 * deltaTime);
        } else if (resonator.isActivated) {
          intensity = Math.max(0.5, intensity - 0.02 * deltaTime);
        } else {
          intensity = Math.max(0.2, intensity - 0.05 * deltaTime);
        }
        
        return {
          ...resonator,
          isReceivingEnergy,
          intensity
        };
      });
    });
  }
  
  /**
   * Activa un resonador por su ID
   */
  public activateResonator(resonatorId: string): void {
    this._resonators.update(resonators => {
      return resonators.map(resonator => {
        if (resonator.id === resonatorId) {
          return {
            ...resonator,
            isActivated: true,
            intensity: 1.0
          };
        }
        return resonator;
      });
    });
    
    // Comprobar posibles conexiones con otros resonadores activos
    this.tryCreateConnections(resonatorId);
  }
  
  /**
   * Intenta crear conexiones entre el resonador activado y otros
   */
  private tryCreateConnections(resonatorId: string): void {
    const activatedResonator = this._resonators().find(r => r.id === resonatorId);
    if (!activatedResonator || !activatedResonator.isActivated) {
      return;
    }
    
    // Buscar otros resonadores activados del mismo tipo
    const otherActivatedResonators = this._resonators().filter(r => 
      r.id !== resonatorId && 
      r.isActivated && 
      r.energyType === activatedResonator.energyType
    );
    
    // Intentar conectar con cada uno
    otherActivatedResonators.forEach(otherResonator => {
      // Comprobar si ya existe una conexión entre estos resonadores
      const existingConnection = this._connections().find(conn => 
        conn.isActive && 
        conn.resonatorIds.includes(resonatorId) && 
        conn.resonatorIds.includes(otherResonator.id)
      );
      
      if (!existingConnection) {
        // Crear nueva conexión
        const connection = createResonatorConnection(
          [resonatorId, otherResonator.id],
          activatedResonator.energyType
        );
        
        this._connections.update(connections => [...connections, connection]);
        
        // Actualizar las conexiones de los resonadores
        this._resonators.update(resonators => {
          return resonators.map(r => {
            if (r.id === resonatorId || r.id === otherResonator.id) {
              return {
                ...r,
                connections: [...r.connections, connection.id]
              };
            }
            return r;
          });
        });
      }
    });
  }
  
  /**
   * Actualiza el estado de todas las conexiones
   */
  private updateConnections(deltaTime: number): void {
    this._connections.update(connections => {
      return connections.map(conn => {
        // Actualizar edad
        const age = conn.age + deltaTime * 1000;
        
        // Comprobar si la conexión sigue activa
        const isActive = conn.duration === -1 || age < conn.duration;
        
        // Comprobar si todos los resonadores siguen activos
        const allResonatorsActive = conn.resonatorIds.every(id => {
          const resonator = this._resonators().find(r => r.id === id);
          return resonator && resonator.isActivated;
        });
        
        // Ajustar intensidad según el estado de los resonadores
        const intensity = allResonatorsActive ? Math.min(1.0, conn.intensity + 0.05 * deltaTime) : conn.intensity * 0.9;
        
        return {
          ...conn,
          age,
          isActive: isActive && allResonatorsActive,
          intensity
        };
      }).filter(conn => conn.isActive);
    });
  }
  
  /**
   * Actualiza el estado de todos los patrones
   */
  private updatePatterns(deltaTime: number): void {
    this._patterns.update(patterns => {
      return patterns.map(pattern => {
        // Comprobar si todas las conexiones del patrón siguen activas
        const allConnectionsActive = pattern.connectionIds.every(id => {
          const connection = this._connections().find(c => c.id === id);
          return connection && connection.isActive;
        });
        
        // Si el patrón está completo, actualizar tiempo activo
        const activeTime = pattern.isComplete ? pattern.activeTime + deltaTime * 1000 : 0;
        
        return {
          ...pattern,
          isComplete: allConnectionsActive,
          activeTime: allConnectionsActive ? activeTime : 0
        };
      });
    });
  }
  
  /**
   * Comprueba si se han formado nuevos patrones
   */
  private checkForNewPatterns(): void {
    // Obtener conexiones activas
    const activeConnections = this._connections().filter(conn => conn.isActive);
    
    // Agrupar conexiones por tipo de energía
    const connectionsByEnergy: Record<EnergyType, ResonatorConnection[]> = {
      [EnergyType.CALM]: [],
      [EnergyType.VIBRANT]: [],
      [EnergyType.INTENSE]: [],
      [EnergyType.HARMONIC]: []
    };
    
    activeConnections.forEach(conn => {
      connectionsByEnergy[conn.energyType].push(conn);
    });
    
    // Buscar patrones para cada tipo de energía
    Object.entries(connectionsByEnergy).forEach(([energyType, connections]) => {
      if (connections.length < 3) {
        return; // Necesitamos al menos 3 conexiones para formar un patrón
      }
      
      // Obtener todos los resonadores involucrados
      const resonatorIds = new Set<string>();
      connections.forEach(conn => {
        conn.resonatorIds.forEach(id => resonatorIds.add(id));
      });
      
      // Comprobar si este patrón ya existe
      const patternExists = this._patterns().some(pattern => {
        const patternResonatorSet = new Set(pattern.resonatorIds);
        const currentResonatorSet = new Set(Array.from(resonatorIds));
        
        // Comparar tamaños
        if (patternResonatorSet.size !== currentResonatorSet.size) {
          return false;
        }
        
        // Comprobar si todos los elementos son iguales
        return Array.from(patternResonatorSet).every(id => currentResonatorSet.has(id));
      });
      
      if (!patternExists && resonatorIds.size >= 3) {
        // Crear nuevo patrón
        const connectionIds = connections.map(conn => conn.id);
        const patternName = this.generatePatternName(resonatorIds.size, energyType as EnergyType);
        
        const pattern = createHarmonicPattern(
          patternName,
          Array.from(resonatorIds),
          connectionIds,
          energyType as EnergyType
        );
        
        this._patterns.update(patterns => [...patterns, pattern]);
        
        // Notificar al motor de juego
        this.gameEngine.onPatternCompleted(pattern);
      }
    });
  }
  
  /**
   * Genera un nombre para un patrón basado en su tamaño y tipo de energía
   */
  private generatePatternName(size: number, energyType: EnergyType): string {
    const energyNames = {
      [EnergyType.CALM]: 'Agua',
      [EnergyType.VIBRANT]: 'Bosque',
      [EnergyType.INTENSE]: 'Fuego',
      [EnergyType.HARMONIC]: 'Armonía'
    };
    
    const sizeNames = {
      3: 'Triángulo',
      4: 'Cuadrado',
      5: 'Pentágono',
      6: 'Hexágono',
      7: 'Heptágono',
      8: 'Octágono'
    };
    
    const sizeName = sizeNames[size as keyof typeof sizeNames] || `Polígono ${size}`;
    const energyName = energyNames[energyType];
    
    return `${sizeName} de ${energyName}`;
  }
}

/**
 * Tipos de patrones predefinidos que pueden formarse
 */
export enum PatternType {
  TRIANGLE = 'triangle',
  SQUARE = 'square',
  PENTAGON = 'pentagon',
  STAR = 'star',
  CIRCLE = 'circle',
  SPIRAL = 'spiral',
  INFINITY = 'infinity'
}
