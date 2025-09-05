import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Observable, interval, takeUntil } from 'rxjs';
import { 
  Player, 
  createPlayer, 
  Obstacle, 
  PowerUp, 
  GameState, 
  GameMode, 
  GameEvent,
  GameConfig, 
  createDefaultGameConfig,
  createMeditationConfig,
  GameEventData 
} from '../models';

/**
 * Servicio principal del motor de juego Zen Flow
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
  private _player = signal<Player>(createPlayer());
  private _obstacles = signal<Obstacle[]>([]);
  private _powerUps = signal<PowerUp[]>([]);
  private _config = signal<GameConfig>(createDefaultGameConfig());
  private _fps = signal<number>(0);
  private _deltaTime = signal<number>(0);
  
  // Eventos del juego
  private gameEventsSubject = new Subject<GameEventData>();
  
  // Signals públicos (read-only)
  public readonly gameState = this._gameState.asReadonly();
  public readonly player = this._player.asReadonly();
  public readonly obstacles = this._obstacles.asReadonly();
  public readonly powerUps = this._powerUps.asReadonly();
  public readonly config = this._config.asReadonly();
  public readonly fps = this._fps.asReadonly();
  public readonly deltaTime = this._deltaTime.asReadonly();
  
  // Computed signals
  public readonly isPlaying = computed(() => this.gameState() === GameState.PLAYING);
  public readonly isPaused = computed(() => this.gameState() === GameState.PAUSED);
  public readonly isGameOver = computed(() => this.gameState() === GameState.GAME_OVER);
  public readonly totalObjects = computed(() => this.obstacles().length + this.powerUps().length);
  
  // Observable de eventos
  public readonly gameEvents$: Observable<GameEventData> = this.gameEventsSubject.asObservable();
  
  constructor() {
    this.initializeGame();
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
    this._player.set(createPlayer());
    this._obstacles.set([]);
    this._powerUps.set([]);
    this._gameState.set(GameState.MENU);
    
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
    if (configOverrides) {
      this._config.update(current => ({ ...current, ...configOverrides }));
    }
    
    // Configurar modo meditación si es necesario
    if (this._config().mode === GameMode.MEDITATION) {
      this._config.set(createMeditationConfig());
    }
    
    // Resetear estado del juego
    this._player.set(createPlayer({
      position: { x: 50, y: this._config().render.canvasSize.height / 2 }
    }));
    this._obstacles.set([]);
    this._powerUps.set([]);
    
    // Cambiar estado y iniciar loop
    this._gameState.set(GameState.PLAYING);
    this.startGameLoop();
    
    this.emitGameEvent(GameEvent.GAME_STARTED, { 
      timestamp: Date.now(),
      config: this._config() 
    });
  }
  
  /**
   * Pausa el juego
   */
  public pauseGame(): void {
    if (!this.isPlaying()) {
      console.warn('Game is not running');
      return;
    }
    
    this._gameState.set(GameState.PAUSED);
    this.stopGameLoop();
    
    this.emitGameEvent(GameEvent.GAME_PAUSED, { timestamp: Date.now() });
  }
  
  /**
   * Reanuda el juego
   */
  public resumeGame(): void {
    if (!this.isPaused()) {
      console.warn('Game is not paused');
      return;
    }
    
    this._gameState.set(GameState.PLAYING);
    this.startGameLoop();
    
    this.emitGameEvent(GameEvent.GAME_RESUMED, { timestamp: Date.now() });
  }
  
  /**
   * Reinicia el juego completamente
   */
  public resetGame(): void {
    this.stopGameLoop();
    this.initializeGame();
  }
  
  /**
   * Termina el juego y muestra estadísticas
   */
  public endGame(): void {
    this.stopGameLoop();
    this._gameState.set(GameState.GAME_OVER);
    
    this.emitGameEvent(GameEvent.GAME_ENDED, { 
      timestamp: Date.now(),
      finalScore: this._player().score,
      level: this._player().level,
      zenProgress: this._player().zenProgress
    });
  }
  
  /**
   * Actualiza el estado del juego (llamado desde el game loop)
   */
  public updateState(deltaTime: number): void {
    if (!this.isPlaying()) return;
    
    this._deltaTime.set(deltaTime);
    
    // Actualizar jugador
    this.updatePlayer(deltaTime);
    
    // Actualizar obstáculos
    this.updateObstacles(deltaTime);
    
    // Actualizar power-ups
    this.updatePowerUps(deltaTime);
    
    // Verificar condiciones de fin de juego
    this.checkGameEndConditions();
  }
  
  /**
   * Actualiza el estado del jugador
   */
  private updatePlayer(deltaTime: number): void {
    const currentPlayer = this._player();
    const config = this._config();
    
    // Aplicar física básica
    let newVelocity = { ...currentPlayer.velocity };
    
    // Aplicar gravedad
    newVelocity.y += config.physics.gravity * deltaTime;
    
    // Aplicar fricción
    newVelocity.x *= config.physics.friction;
    newVelocity.y *= config.physics.friction;
    
    // Limitar velocidad máxima
    const speed = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);
    if (speed > config.physics.maxSpeed) {
      const scale = config.physics.maxSpeed / speed;
      newVelocity.x *= scale;
      newVelocity.y *= scale;
    }
    
    // Actualizar posición
    const newPosition = {
      x: currentPlayer.position.x + newVelocity.x * deltaTime,
      y: currentPlayer.position.y + newVelocity.y * deltaTime
    };
    
    // Mantener jugador dentro de los límites
    const canvasSize = config.render.canvasSize;
    newPosition.x = Math.max(currentPlayer.radius, Math.min(canvasSize.width - currentPlayer.radius, newPosition.x));
    newPosition.y = Math.max(currentPlayer.radius, Math.min(canvasSize.height - currentPlayer.radius, newPosition.y));
    
    // Calcular progreso zen (distancia al centro)
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const distanceToCenter = Math.sqrt((newPosition.x - centerX) ** 2 + (newPosition.y - centerY) ** 2);
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    const zenProgress = Math.max(0, 1 - (distanceToCenter / maxDistance));
    
    // Actualizar player
    this._player.set({
      ...currentPlayer,
      position: newPosition,
      velocity: newVelocity,
      zenProgress
    });
  }
  
  /**
   * Actualiza los obstáculos
   */
  private updateObstacles(deltaTime: number): void {
    const currentObstacles = this._obstacles();
    const updatedObstacles = currentObstacles
      .map(obstacle => {
        // Actualizar posición si es móvil
        if (obstacle.type === 'moving' && obstacle.velocity) {
          return {
            ...obstacle,
            position: {
              x: obstacle.position.x + obstacle.velocity.x * deltaTime,
              y: obstacle.position.y + obstacle.velocity.y * deltaTime
            }
          };
        }
        
        // Actualizar rotación si es rotativo
        if (obstacle.type === 'rotating' && obstacle.rotationSpeed) {
          return {
            ...obstacle,
            rotation: obstacle.rotation + obstacle.rotationSpeed * deltaTime
          };
        }
        
        return obstacle;
      })
      .filter(obstacle => obstacle.isActive); // Remover obstáculos inactivos
    
    this._obstacles.set(updatedObstacles);
  }
  
  /**
   * Actualiza los power-ups
   */
  private updatePowerUps(deltaTime: number): void {
    const currentPowerUps = this._powerUps();
    const updatedPowerUps = currentPowerUps
      .map(powerUp => ({
        ...powerUp,
        age: powerUp.age + deltaTime
      }))
      .filter(powerUp => powerUp.isActive && powerUp.age < powerUp.lifeTime);
    
    this._powerUps.set(updatedPowerUps);
  }
  
  /**
   * Verifica condiciones de fin de juego
   */
  private checkGameEndConditions(): void {
    const player = this._player();
    
    // Verificar si el jugador perdió toda su energía
    if (player.energy <= 0) {
      this.emitGameEvent(GameEvent.ENERGY_DEPLETED, { timestamp: Date.now() });
      this.endGame();
      return;
    }
    
    // Verificar si alcanzó el centro zen (victoria)
    if (player.zenProgress >= 1.0) {
      this._gameState.set(GameState.VICTORY);
      this.emitGameEvent(GameEvent.ZEN_PROGRESS, { 
        timestamp: Date.now(), 
        progress: player.zenProgress 
      });
      this.endGame();
    }
  }
  
  /**
   * Maneja la entrada del jugador (impulso hacia arriba)
   */
  public handlePlayerInput(): void {
    if (!this.isPlaying()) return;
    
    const currentPlayer = this._player();
    const config = this._config();
    
    // Aplicar impulso hacia arriba
    const newVelocity = {
      ...currentPlayer.velocity,
      y: currentPlayer.velocity.y - config.physics.impulseForce
    };
    
    this._player.update(player => ({
      ...player,
      velocity: newVelocity
    }));
  }
  
  /**
   * Inicia el game loop
   */
  private startGameLoop(): void {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    
    const loop = (currentTime: number) => {
      if (!this.isPlaying()) return;
      
      const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convertir a segundos
      this.lastFrameTime = currentTime;
      this.frameCount++;
      
      // Calcular FPS cada segundo
      if (this.frameCount % 60 === 0) {
        this._fps.set(Math.round(1 / deltaTime));
      }
      
      // Actualizar estado del juego
      this.updateState(deltaTime);
      
      // Continuar el loop
      this.gameLoopInterval = requestAnimationFrame(loop);
    };
    
    this.gameLoopInterval = requestAnimationFrame(loop);
  }
  
  /**
   * Detiene el game loop
   */
  private stopGameLoop(): void {
    if (this.gameLoopInterval) {
      cancelAnimationFrame(this.gameLoopInterval);
      this.gameLoopInterval = undefined;
    }
  }
  
  /**
   * Emite un evento del juego
   */
  private emitGameEvent(type: GameEvent, data?: any): void {
    this.gameEventsSubject.next({
      type,
      timestamp: Date.now(),
      data
    });
  }
  
  /**
   * Métodos de utilidad para acceso externo
   */
  public getGameState(): GameState {
    return this._gameState();
  }
  
  public getPlayer(): Player {
    return this._player();
  }
  
  public getObstacles(): Obstacle[] {
    return this._obstacles();
  }
  
  public getPowerUps(): PowerUp[] {
    return this._powerUps();
  }
  
  public getConfig(): GameConfig {
    return this._config();
  }
}
