import { Injectable, signal, computed, effect, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { 
  HarmonicCore,
  createHarmonicCore,
  Dissonance,
  createDissonance,
  HarmonyAmplifier,
  createHarmonyAmplifier,
  GameState, 
  GameMode,
  GameEvent,
  GameConfig, 
  createDefaultGameConfig,
  createHarmonyConfig,
  createResonanceConfig,
  createBalanceConfig,
  GameEventData,
  Position,
  HarmonicPattern,
  EnergyType,
  ResonatorConnection
} from '../models';

// Tipos utilizados en este servicio
export type DissonanceType = 'static' | 'moving' | 'pulsating' | 'disruptive';
export type DissonanceShape = 'circle' | 'square' | 'triangle' | 'irregular';
export type HarmonyAmplifierType = 'energy' | 'frequency' | 'amplitude' | 'resonance' | 
                                 'balance' | 'clarity' | 'expansion' | 'stability';

/**
 * Servicio principal del motor de juego Zen Harmonics
 * Gestiona el estado del juego, la lógica principal y el game loop
 */
@Injectable({
  providedIn: 'root'
})
export class GameEngineService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private gameLoopInterval?: number;
  private lastFrameTime = 0;
  private frameCount = 0;
  
  // Estado del juego con signals
  private _gameState = signal<GameState>(GameState.MENU);
  private _harmonicCore = signal<HarmonicCore>(createHarmonicCore());
  private _dissonances = signal<Dissonance[]>([]);
  private _amplifiers = signal<HarmonyAmplifier[]>([]);
  private _config = signal<GameConfig>(createDefaultGameConfig());
  private _fps = signal<number>(0);
  private _deltaTime = signal<number>(0);
  private _score = signal<number>(0);
  private _harmonicPatterns = signal<HarmonicPattern[]>([]);
  
  // Temporizadores
  private dissonanceSpawnTimer = 0;
  private amplifierSpawnTimer = 0;
  private patternCheckTimer = 0;

  // Colisión buffer
  private readonly collisionCooldown = 0.6; // s entre golpes
  private coreHitCooldown = 0;
  
  // Eventos del juego
  private gameEventsSubject = new Subject<GameEventData>();
  
  // Signals públicos (read-only)
  public readonly gameState = this._gameState.asReadonly();
  public readonly harmonicCore = this._harmonicCore.asReadonly();
  public readonly dissonances = this._dissonances.asReadonly();
  public readonly amplifiers = this._amplifiers.asReadonly();
  public readonly config = this._config.asReadonly();
  public readonly fps = this._fps.asReadonly();
  public readonly deltaTime = this._deltaTime.asReadonly();
  public readonly score = this._score.asReadonly();
  public readonly harmonicPatterns = this._harmonicPatterns.asReadonly();
  
  // Computed signals
  public readonly isPlaying = computed(() => this._gameState() === GameState.PLAYING);
  public readonly isPaused = computed(() => this._gameState() === GameState.PAUSED);
  public readonly isGameOver = computed(() => this._gameState() === GameState.GAME_OVER);
  public readonly totalObjects = computed(() => this._dissonances().length + this._amplifiers().length);
  public readonly totalPatterns = computed(() => this._harmonicPatterns().length);
  public readonly coreEnergy = computed(() => this._harmonicCore().energy);
  public readonly corePosition = computed(() => this._harmonicCore().position);
  
  // Observable de eventos
  public readonly gameEvents$: Observable<GameEventData> = this.gameEventsSubject.asObservable();
  
  constructor() {
    this.initializeGame();
    
    // Efectos para manejar cambios de estado
    effect(() => {
      const isPlaying = this.isPlaying();
      if (isPlaying) {
        this.startGameLoop();
      } else {
        this.stopGameLoop();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopGameLoop();
  }
  
  /**
   * Inicializa el juego con configuración por defecto
   */
  private initializeGame(): void {
    this._harmonicCore.set(createHarmonicCore());
    this._dissonances.set([]);
    this._amplifiers.set([]);
    this._harmonicPatterns.set([]);
    this._gameState.set(GameState.MENU);
    this._score.set(0);
    
    this.emitGameEvent(GameEvent.GAME_STARTED, { 
      mode: this._config().mode,
      difficulty: this._config().difficulty 
    });
  }
  
  /**
   * Inicia el juego con configuración opcional
   */
  public startGame(configOverrides?: Partial<GameConfig>): void {
    if (this.isPlaying()) {
      console.warn('Game is already running');
      return;
    }
    
    // Aplicar configuración
    const baseConfig = createDefaultGameConfig();
    this._config.set({ ...baseConfig, ...configOverrides });
    
    // Reiniciar estado
    this._harmonicCore.set(createHarmonicCore({
      position: {
        x: this._config().rendering.canvasSize.width / 2,
        y: this._config().rendering.canvasSize.height / 2
      }
    }));
    
    this._dissonances.set([]);
    this._amplifiers.set([]);
    this._harmonicPatterns.set([]);
    this._score.set(0);
    
    // Cambiar estado
    this._gameState.set(GameState.PLAYING);
    
    // Emitir evento
    this.emitGameEvent(GameEvent.GAME_STARTED, {
      mode: this._config().mode,
      difficulty: this._config().difficulty
    });
    
    console.log('Game started with mode:', this._config().mode);
  }
  
  /**
   * Inicia el juego en modo Armonía
   */
  public startHarmonyGame(): void {
    this.startGame(createHarmonyConfig());
  }
  
  /**
   * Inicia el juego en modo Resonancia
   */
  public startResonanceGame(): void {
    this.startGame(createResonanceConfig());
  }
  
  /**
   * Inicia el juego en modo Equilibrio
   */
  public startBalanceGame(): void {
    this.startGame(createBalanceConfig());
  }
  
  /**
   * Pausa o reanuda el juego
   */
  public togglePause(): void {
    if (this._gameState() === GameState.PLAYING) {
      this._gameState.set(GameState.PAUSED);
      this.emitGameEvent(GameEvent.GAME_PAUSED, null);
    } else if (this._gameState() === GameState.PAUSED) {
      this._gameState.set(GameState.PLAYING);
      this.emitGameEvent(GameEvent.GAME_RESUMED, null);
    }
  }
  
  /**
   * Finaliza el juego actual
   */
  public endGame(): void {
    if (this._gameState() === GameState.PLAYING || this._gameState() === GameState.PAUSED) {
      this._gameState.set(GameState.GAME_OVER);
      
      this.emitGameEvent(GameEvent.GAME_ENDED, {
        score: this._score(),
        patterns: this._harmonicPatterns().length,
        harmonyLevel: this._harmonicCore().harmonyLevel
      });
    }
  }
  
  /**
   * Inicia el bucle principal del juego
   */
  private startGameLoop(): void {
    if (this.gameLoopInterval) {
      return;
    }
    
    this.lastFrameTime = performance.now();
    this.gameLoopInterval = window.setInterval(() => this.gameLoop(), 1000 / 60);
  }
  
  /**
   * Detiene el bucle principal del juego
   */
  private stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = undefined;
    }
  }
  
  /**
   * Bucle principal del juego
   */
  private gameLoop(): void {
    // No actualizar si el juego está pausado o finalizado
    if (this._gameState() !== GameState.PLAYING) {
      return;
    }
    
    // Calcular delta time
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // en segundos
    this.lastFrameTime = currentTime;
    this._deltaTime.set(deltaTime);
    
    // Actualizar FPS
    this.frameCount++;
    if (this.frameCount % 10 === 0) { // Actualizar cada 10 frames
      this._fps.set(Math.round(1 / deltaTime));
    }
    
    // Actualizar lógica del juego
    this.update(deltaTime);
  }
  
  /**
   * Actualiza la lógica del juego
   */
  private update(deltaTime: number): void {
    // Actualizar núcleo armónico
    this.updateHarmonicCore(deltaTime);
    
    // Actualizar disonancias
    this.updateDissonances(deltaTime);
    
    // Actualizar amplificadores
    this.updateAmplifiers(deltaTime);
    
    // Comprobar colisiones
    this.checkCollisions();
    
    // Actualizar temporizadores para spawn
    this.updateSpawnTimers(deltaTime);
    
    // Actualizar puntuación según nivel de armonía
    this.updateScore(deltaTime);
    
    // Comprobar condiciones de victoria/derrota
    this.checkGameConditions();
  }
  
  /**
   * Actualiza el núcleo armónico
   */
  private updateHarmonicCore(deltaTime: number): void {
    const core = this._harmonicCore();
    const config = this._config();
    
    // Aplicar física
    let newPosition = { ...core.position };
    let newVelocity = { ...core.velocity };
    
    // Aplicar gravedad si está activada
    if (config.physics.gravity > 0) {
      newVelocity.y += config.physics.gravity * deltaTime;
    }
    
    // Aplicar fricción
    newVelocity.x *= config.physics.friction;
    newVelocity.y *= config.physics.friction;
    
    // Aplicar amortiguación
    const speed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
    if (speed > config.physics.maxSpeed) {
      const dampingFactor = config.physics.maxSpeed / speed;
      newVelocity.x *= dampingFactor;
      newVelocity.y *= dampingFactor;
    }
    
    // Actualizar posición
    newPosition.x += newVelocity.x;
    newPosition.y += newVelocity.y;
    
    // Mantener dentro de los límites del canvas
    const { width, height } = config.rendering.canvasSize;
    const { radius } = core;
    
    if (newPosition.x - radius < 0) {
      newPosition.x = radius;
      newVelocity.x = Math.abs(newVelocity.x) * 0.5; // Rebote
    } else if (newPosition.x + radius > width) {
      newPosition.x = width - radius;
      newVelocity.x = -Math.abs(newVelocity.x) * 0.5; // Rebote
    }
    
    if (newPosition.y - radius < 0) {
      newPosition.y = radius;
      newVelocity.y = Math.abs(newVelocity.y) * 0.5; // Rebote
    } else if (newPosition.y + radius > height) {
      newPosition.y = height - radius;
      newVelocity.y = -Math.abs(newVelocity.y) * 0.5; // Rebote
    }
    
    // Actualizar energía (decaimiento natural)
    const energyDecay = config.energy.decayRate * deltaTime;
    let newEnergy = Math.max(0, core.energy - energyDecay);
    
    // Actualizar brightness basado en energía
    const brightnessRatio = newEnergy / core.maxEnergy;
    const newBrightness = 0.3 + (brightnessRatio * 0.7); // 0.3 a 1.0
    
    // Actualizar el núcleo
    this._harmonicCore.set({
      ...core,
      position: newPosition,
      velocity: newVelocity,
      energy: newEnergy,
      brightness: newBrightness,
      isActive: newEnergy > 0
    });
    
    // Comprobar si se ha agotado la energía
    if (newEnergy <= 0 && core.energy > 0) {
      this.emitGameEvent(GameEvent.ENERGY_DEPLETED, null);
      this.endGame();
    }
  }
  
  /**
   * Aplica impulso al núcleo armónico
   */
  public applyImpulse(direction: Position): void {
    if (!this.isPlaying()) return;
    
    const core = this._harmonicCore();
    const config = this._config();
    
    // Normalizar el vector de dirección
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    const normalizedDir = {
      x: direction.x / magnitude,
      y: direction.y / magnitude
    };
    
    // Aplicar impulso según la fuerza configurada
    const impulseForce = config.physics.impulseForce;
    const newVelocity = {
      x: core.velocity.x + normalizedDir.x * impulseForce,
      y: core.velocity.y + normalizedDir.y * impulseForce
    };
    
    // Consumir energía por el impulso
    const energyCost = 2;
    const newEnergy = Math.max(0, core.energy - energyCost);
    
    this._harmonicCore.update(core => ({
      ...core,
      velocity: newVelocity,
      energy: newEnergy
    }));
  }
  
  /**
   * Genera una onda armónica desde el núcleo
   */
  public generateWave(energyType: EnergyType): void {
    if (!this.isPlaying()) return;
    
    const core = this._harmonicCore();
    
    // Comprobar si hay suficiente energía
    const energyCost = 5;
    if (core.energy < energyCost) {
      return;
    }
    
    // Consumir energía
    const newEnergy = core.energy - energyCost;
    
    this._harmonicCore.update(core => ({
      ...core,
      energy: newEnergy
    }));
    
    // La generación real de la onda se hace en el servicio HarmonicSystem
    // que está inyectado en el componente del juego
    
    // Emitir evento
    this.emitGameEvent(GameEvent.RESONATOR_CONNECTED, {
      position: core.position,
      energyType
    });
  }
  
  /**
   * Actualiza las disonancias
   */
  private updateDissonances(deltaTime: number): void {
    this._dissonances.update(dissonances => {
      return dissonances
        .map(dissonance => this.updateDissonance(dissonance, deltaTime))
        .filter(dissonance => dissonance.isActive);
    });
  }
  
  /**
   * Actualiza una disonancia individual
   */
  private updateDissonance(dissonance: Dissonance, deltaTime: number): Dissonance {
    // Actualizar edad
    const age = dissonance.age + deltaTime * 1000;
    
    // Comprobar tiempo de vida
    const isActive = dissonance.lifeTime ? age < dissonance.lifeTime : true;
    
    // Actualizar posición para disonancias móviles
    let newPosition = { ...dissonance.position };
    if (dissonance.type === 'moving' && dissonance.velocity) {
      newPosition.x += dissonance.velocity.x * deltaTime;
      newPosition.y += dissonance.velocity.y * deltaTime;
      
      // Mantener dentro de los límites
      const { width, height } = this._config().rendering.canvasSize;
      const radius = dissonance.radius || 15;
      
      if (newPosition.x - radius < 0 || newPosition.x + radius > width) {
        if (dissonance.velocity) {
          dissonance.velocity.x = -dissonance.velocity.x;
        }
        newPosition.x = Math.max(radius, Math.min(width - radius, newPosition.x));
      }
      
      if (newPosition.y - radius < 0 || newPosition.y + radius > height) {
        if (dissonance.velocity) {
          dissonance.velocity.y = -dissonance.velocity.y;
        }
        newPosition.y = Math.max(radius, Math.min(height - radius, newPosition.y));
      }
    }
    
    // Actualizar rotación para disonancias rotativas
    let newRotation = dissonance.rotation || 0;
    if (dissonance.rotationSpeed) {
      newRotation += dissonance.rotationSpeed * deltaTime;
      // Normalizar a 2π
      newRotation = newRotation % (Math.PI * 2);
    }
    
    // Actualizar opacidad para disonancias pulsantes
    let newOpacity = dissonance.opacity;
    if (dissonance.type === 'pulsating' && dissonance.pulseFrequency) {
      const pulsePhase = Math.sin(age * dissonance.pulseFrequency / 1000);
      newOpacity = 0.4 + pulsePhase * 0.4; // Variar entre 0.4 y 0.8
    }
    
    return {
      ...dissonance,
      position: newPosition,
      rotation: newRotation,
      opacity: newOpacity,
      age,
      isActive
    };
  }
  
  /**
   * Genera una nueva disonancia
   */
  private spawnDissonance(): void {
    const config = this._config();
    const { width, height } = config.rendering.canvasSize;
    const core = this._harmonicCore();
    
    // Generar posición aleatoria que no esté demasiado cerca del núcleo
    let x, y, distance;
    const minDistance = 100; // Distancia mínima al núcleo
    
    do {
      x = Math.random() * width;
      y = Math.random() * height;
      const dx = x - core.position.x;
      const dy = y - core.position.y;
      distance = Math.sqrt(dx * dx + dy * dy);
    } while (distance < minDistance);
    
    // Determinar tipo de disonancia aleatoriamente
    const types: DissonanceType[] = ['static', 'moving', 'pulsating', 'disruptive'];
    const typeIndex = Math.floor(Math.random() * types.length);
    const type = types[typeIndex];
    
    // Determinar forma aleatoriamente
    const shapes: DissonanceShape[] = ['circle', 'square', 'triangle', 'irregular'];
    const shapeIndex = Math.floor(Math.random() * shapes.length);
    const shape = shapes[shapeIndex];
    
    // Determinar tipo de energía que contrarresta
    const energyTypes = [EnergyType.CALM, EnergyType.VIBRANT, EnergyType.INTENSE];
    const energyIndex = Math.floor(Math.random() * energyTypes.length);
    const countersEnergy = energyTypes[energyIndex];
    
    // Crear la disonancia con propiedades específicas según el tipo
    let dissonanceProps: Partial<Dissonance> = {
      position: { x, y },
      type,
      shape,
      countersEnergy,
      radius: 15 + Math.random() * 10
    };
    
    if (type === 'moving') {
      dissonanceProps.velocity = {
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 50
      };
    }
    
    if (type === 'disruptive') {
      dissonanceProps.rotationSpeed = (Math.random() + 0.5) * Math.PI / 2;
    }
    
    if (type === 'pulsating') {
      dissonanceProps.pulseFrequency = 2 + Math.random() * 3;
    }
    
    // Asignar color según el tipo de energía que contrarresta
    const colors = {
      [EnergyType.CALM]: '#ff6b6b',     // Rojo (contrario a azul/calma)
      [EnergyType.VIBRANT]: '#9775fa',  // Púrpura (contrario a verde/vibración)
      [EnergyType.INTENSE]: '#4ecdc4'   // Turquesa (contrario a rojo/intensidad)
    };
    
    dissonanceProps.color = colors[countersEnergy];
    dissonanceProps.disruptionLevel = 10 + Math.floor(Math.random() * 10);
    
    // Tiempo de vida según dificultad
    const lifeTimeBase = 20000; // 20 segundos base
    
    dissonanceProps.lifeTime = lifeTimeBase;
    
    // Crear y añadir la disonancia
    const dissonance = createDissonance(dissonanceProps);
    this._dissonances.update(dissonances => [...dissonances, dissonance]);
  }
  
  /**
   * Actualiza los amplificadores
   */
  private updateAmplifiers(deltaTime: number): void {
    this._amplifiers.update(amplifiers => {
      return amplifiers
        .map(amplifier => this.updateAmplifier(amplifier, deltaTime))
        .filter(amplifier => amplifier.isActive && amplifier.age < amplifier.lifeTime);
    });
  }
  
  /**
   * Actualiza un amplificador individual
   */
  private updateAmplifier(amplifier: HarmonyAmplifier, deltaTime: number): HarmonyAmplifier {
    // Actualizar edad
    const age = amplifier.age + deltaTime * 1000;
    
    // Calcular opacidad basada en el tiempo de vida
    const lifeRatio = 1 - (age / amplifier.lifeTime);
    const newOpacity = Math.max(0.2, amplifier.opacity * (lifeRatio + 0.2));
    
    return {
      ...amplifier,
      age,
      opacity: newOpacity
    };
  }
  
  /**
   * Genera un nuevo amplificador
   */
  private spawnAmplifier(): void {
    const config = this._config();
    const { width, height } = config.rendering.canvasSize;
    
    // Generar posición aleatoria
    const x = Math.random() * width;
    const y = Math.random() * height;
    
    // Determinar tipo de amplificador aleatoriamente
    const types: HarmonyAmplifierType[] = [
      'energy', 'frequency', 'amplitude', 'resonance', 
      'balance', 'clarity', 'expansion', 'stability'
    ];
    
    // Asignar probabilidades diferentes a cada tipo
    const probabilities = [0.25, 0.15, 0.15, 0.1, 0.1, 0.1, 0.1, 0.05];
    let cumulativeProbability = 0;
    const random = Math.random();
    
    let selectedType = types[0];
    for (let i = 0; i < types.length; i++) {
      cumulativeProbability += probabilities[i];
      if (random <= cumulativeProbability) {
        selectedType = types[i];
        break;
      }
    }
    
    // Determinar tipo de energía
    const energyTypes = [EnergyType.CALM, EnergyType.VIBRANT, EnergyType.INTENSE];
    const energyIndex = Math.floor(Math.random() * energyTypes.length);
    const energyType = energyTypes[energyIndex];
    
    // Crear el amplificador
    const amplifier = createHarmonyAmplifier(selectedType, { x, y }, energyType);
    this._amplifiers.update(amplifiers => [...amplifiers, amplifier]);
  }
  
  /**
   * Actualiza los temporizadores para generación de objetos
   */
  private updateSpawnTimers(deltaTime: number): void {
    const config = this._config();
    
    // Actualizar temporizador de disonancias
    this.dissonanceSpawnTimer += deltaTime;
    const dissonanceInterval = 1 / config.spawning.dissonanceRate;
    
    if (this.dissonanceSpawnTimer >= dissonanceInterval && 
        this._dissonances().length < config.spawning.maxDissonances) {
      this.spawnDissonance();
      this.dissonanceSpawnTimer = 0;
    }
    
    // Actualizar temporizador de amplificadores
    this.amplifierSpawnTimer += deltaTime;
    const amplifierInterval = 1 / config.spawning.amplifierRate;
    
    if (this.amplifierSpawnTimer >= amplifierInterval && 
        this._amplifiers().length < config.spawning.maxAmplifiers) {
      this.spawnAmplifier();
      this.amplifierSpawnTimer = 0;
    }
    
    // Actualizar temporizador de comprobación de patrones
    this.patternCheckTimer += deltaTime;
    if (this.patternCheckTimer >= config.spawning.patternInterval) {
      // La verificación de patrones se realiza en HarmonicSystemService
      this.patternCheckTimer = 0;
    }
  }
  
  /**
   * Comprueba colisiones entre objetos
   */
  private checkCollisions(): void {
    const core = this._harmonicCore();
    
    // No comprobar colisiones si el núcleo está en tiempo de invulnerabilidad
    if (this.coreHitCooldown > 0) {
      this.coreHitCooldown -= this._deltaTime();
      return;
    }
    
    // Comprobar colisiones con disonancias
    for (const dissonance of this._dissonances()) {
      if (!dissonance.isActive) continue;
      
      // Calcular distancia
      const dx = dissonance.position.x - core.position.x;
      const dy = dissonance.position.y - core.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Radio de colisión
      const dissonanceRadius = dissonance.radius || 15;
      const collisionDistance = core.radius + dissonanceRadius;
      
      if (distance < collisionDistance) {
        this.handleDissonanceCollision(dissonance);
        break; // Solo procesar una colisión por frame
      }
    }
    
    // Comprobar colisiones con amplificadores
    for (const amplifier of this._amplifiers()) {
      if (!amplifier.isActive) continue;
      
      // Calcular distancia
      const dx = amplifier.position.x - core.position.x;
      const dy = amplifier.position.y - core.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Radio de colisión
      const collisionDistance = core.radius + amplifier.radius;
      
      if (distance < collisionDistance) {
        this.handleAmplifierCollision(amplifier);
        break; // Solo procesar una colisión por frame
      }
    }
  }
  
  /**
   * Maneja colisión con una disonancia
   */
  private handleDissonanceCollision(dissonance: Dissonance): void {
    // Aplicar daño al núcleo
    const core = this._harmonicCore();
    const newEnergy = Math.max(0, core.energy - dissonance.disruptionLevel);
    
    // Aplicar efecto de rebote
    const dx = core.position.x - dissonance.position.x;
    const dy = core.position.y - dissonance.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const knockbackForce = 2;
    const newVelocity = {
      x: core.velocity.x + (dx / distance) * knockbackForce,
      y: core.velocity.y + (dy / distance) * knockbackForce
    };
    
    // Actualizar núcleo
    this._harmonicCore.set({
      ...core,
      energy: newEnergy,
      velocity: newVelocity
    });
    
    // Desactivar la disonancia
    this._dissonances.update(dissonances => 
      dissonances.map(d => 
        d.id === dissonance.id ? { ...d, isActive: false } : d
      )
    );
    
    // Activar tiempo de invulnerabilidad
    this.coreHitCooldown = this.collisionCooldown;
    
    // Emitir evento
    this.emitGameEvent(GameEvent.CORE_COLLISION, {
      position: dissonance.position,
      disruptionLevel: dissonance.disruptionLevel,
      type: dissonance.type
    });
  }
  
  /**
   * Maneja colisión con un amplificador
   */
  private handleAmplifierCollision(amplifier: HarmonyAmplifier): void {
    // Aplicar efecto según tipo de amplificador
    this.applyAmplifierEffect(amplifier);
    
    // Desactivar el amplificador
    this._amplifiers.update(amplifiers => 
      amplifiers.map(a => 
        a.id === amplifier.id ? { ...a, isActive: false } : a
      )
    );
    
    // Emitir evento
    this.emitGameEvent(GameEvent.POWERUP_COLLECTED, {
      position: amplifier.position,
      type: amplifier.type,
      value: amplifier.value
    });
  }
  
  /**
   * Aplica el efecto de un amplificador según su tipo
   */
  private applyAmplifierEffect(amplifier: HarmonyAmplifier): void {
    const core = this._harmonicCore();
    
    switch (amplifier.type) {
      case 'energy':
        // Restaurar energía
        const newEnergy = Math.min(core.maxEnergy, core.energy + amplifier.value);
        this._harmonicCore.update(core => ({ ...core, energy: newEnergy }));
        break;
        
      case 'frequency':
        // Aumentar frecuencia de ondas
        this._harmonicCore.update(core => ({ 
          ...core, 
          frequency: core.frequency + amplifier.value,
          activeEffects: [...core.activeEffects, 'frequency_boost']
        }));
        
        // Programar la eliminación del efecto
        setTimeout(() => {
          this._harmonicCore.update(core => ({ 
            ...core, 
            frequency: Math.max(1.0, core.frequency - amplifier.value),
            activeEffects: core.activeEffects.filter(e => e !== 'frequency_boost')
          }));
        }, amplifier.duration);
        break;
        
      case 'amplitude':
        // Aumentar amplitud de ondas
        this._harmonicCore.update(core => ({ 
          ...core, 
          amplitude: core.amplitude + amplifier.value,
          activeEffects: [...core.activeEffects, 'amplitude_boost']
        }));
        
        // Programar la eliminación del efecto
        setTimeout(() => {
          this._harmonicCore.update(core => ({ 
            ...core, 
            amplitude: Math.max(1.0, core.amplitude - amplifier.value),
            activeEffects: core.activeEffects.filter(e => e !== 'amplitude_boost')
          }));
        }, amplifier.duration);
        break;
        
      case 'balance':
        // Mejorar el balance energético
        const currentBalance = core.energyBalance;
        const totalEnergy = currentBalance.calm + currentBalance.vibrant + currentBalance.intense;
        const idealBalance = {
          calm: totalEnergy / 3,
          vibrant: totalEnergy / 3,
          intense: totalEnergy / 3
        };
        
        // Acercar hacia el balance ideal
        const adjustmentFactor = amplifier.value; // 0-1, qué tanto se acerca al ideal
        const newBalance = {
          calm: currentBalance.calm * (1 - adjustmentFactor) + idealBalance.calm * adjustmentFactor,
          vibrant: currentBalance.vibrant * (1 - adjustmentFactor) + idealBalance.vibrant * adjustmentFactor,
          intense: currentBalance.intense * (1 - adjustmentFactor) + idealBalance.intense * adjustmentFactor
        };
        
        this._harmonicCore.update(core => ({ 
          ...core, 
          energyBalance: newBalance,
          activeEffects: [...core.activeEffects, 'balance_boost']
        }));
        
        // Emitir evento de balance
        this.emitGameEvent(GameEvent.ENERGY_BALANCED, {
          oldBalance: currentBalance,
          newBalance
        });
        break;
        
      // Implementar otros tipos...
      default:
        // Aumentar puntuación como efecto genérico
        this._score.update(score => score + 10);
    }
  }
  
  /**
   * Actualiza la puntuación según varios factores
   */
  private updateScore(deltaTime: number): void {
    const core = this._harmonicCore();
    
    // Puntos base por tiempo
    const timeScore = deltaTime * core.harmonyLevel * 0.5;
    
    // Puntos por balance energético
    const balance = core.energyBalance;
    const total = balance.calm + balance.vibrant + balance.intense;
    const idealRatio = total / 3;
    
    // Calcular desviación del balance ideal
    const deviation = Math.abs(balance.calm - idealRatio) + 
                     Math.abs(balance.vibrant - idealRatio) + 
                     Math.abs(balance.intense - idealRatio);
    
    // Normalizar desviación (0 = perfecto, 1 = peor)
    const normalizedDeviation = Math.min(1, deviation / total);
    
    // Bonificación por balance (1.0 = perfecto, 0.5 = peor)
    const balanceMultiplier = 1.0 - (normalizedDeviation * 0.5);
    
    // Puntuación final
    const finalScore = timeScore * balanceMultiplier;
    
    this._score.update(score => score + finalScore);
  }
  
  /**
   * Comprueba condiciones de victoria/derrota
   */
  private checkGameConditions(): void {
    const core = this._harmonicCore();
    
    // Comprobar energía
    if (core.energy <= 0 && this._gameState() === GameState.PLAYING) {
      this.endGame();
    }
    
    // Otros posibles checks...
  }
  
  /**
   * Método llamado cuando se completa un patrón
   */
  public onPatternCompleted(pattern: HarmonicPattern): void {
    // Añadir el patrón a la lista
    this._harmonicPatterns.update(patterns => [...patterns, pattern]);
    
    // Aumentar puntuación
    this._score.update(score => score + pattern.value);
    
    // Emitir evento
    this.emitGameEvent(GameEvent.PATTERN_COMPLETED, {
      patternId: pattern.id,
      name: pattern.name,
      resonatorCount: pattern.resonatorIds.length,
      energyType: pattern.dominantEnergyType,
      value: pattern.value
    });
    
    // Posible aumento de nivel de armonía
    if (this._harmonicPatterns().length % 3 === 0) {
      this._harmonicCore.update(core => ({
        ...core,
        harmonyLevel: core.harmonyLevel + 1
      }));
      
      this.emitGameEvent(GameEvent.HARMONY_INCREASED, {
        newLevel: this._harmonicCore().harmonyLevel
      });
    }
  }
  
  /**
   * Método para conectar dos resonadores
   */
  public connectResonators(connection: ResonatorConnection): void {
    // Este método sería llamado desde HarmonicSystemService
    // Aquí podríamos realizar acciones adicionales como aumentar puntuación
    
    this._score.update(score => score + 5);
    
    this.emitGameEvent(GameEvent.RESONATOR_CONNECTED, {
      resonatorIds: connection.resonatorIds,
      energyType: connection.energyType
    });
  }
  
  /**
   * Emite un evento del juego
   */
  private emitGameEvent(type: GameEvent, data: any): void {
    this.gameEventsSubject.next({
      type,
      timestamp: Date.now(),
      data
    });
  }
}
