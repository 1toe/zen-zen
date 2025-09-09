import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  OnDestroy, 
  inject,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameEngineService, DissonanceShape, HarmonyAmplifierType } from '../../services';
import { ZenIconService } from '../../services/zen-icon.service';
import { Player, Obstacle, PowerUp, GameState } from '../../models';

/**
 * GameCanvasComponent - Renderizado Canvas 2D para Zen Flow
 * Integra el design de ondas zen con el sistema de partículas inside-out vortex
 */
@Component({
  selector: 'app-game-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-container" [class.playing]="isPlaying()">
      <!-- Canvas principal del juego -->
      <canvas 
        #gameCanvas
        class="game-canvas"
        [width]="canvasWidth"
        [height]="canvasHeight"
        (click)="handleCanvasClick($event)"
        (touchstart)="handleTouchStart($event)"
        (touchend)="handleTouchEnd($event)"
        [attr.aria-label]="'Zen Flow Game Canvas - Estado: ' + gameState()">
      </canvas>
      
      <!-- Canvas de efectos (partículas y ondas zen) -->
      <canvas 
        #effectsCanvas
        class="effects-canvas"
        [width]="canvasWidth"
        [height]="canvasHeight">
      </canvas>
      
      <!-- Overlay de controles táctiles -->
      <div class="touch-controls" *ngIf="isMobile">
        <div class="touch-area" (touchstart)="handlePlayerInput($event)">
          <span class="touch-hint">Toca para impulsar</span>
        </div>
      </div>
      
      <!-- Información de depuración -->
      <div class="debug-info" *ngIf="debugMode()">
        <div>FPS: {{ fps() }}</div>
        <div>Obstáculos: {{ obstacles().length }}</div>
        <div>Power-ups: {{ powerUps().length }}</div>
        <div>Partículas: {{ particleCount() }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./game-canvas.component.css']
})
export class GameCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('effectsCanvas', { static: true }) effectsCanvas!: ElementRef<HTMLCanvasElement>;
  
  private gameEngine = inject(GameEngineService);
  private zenIconService = inject(ZenIconService);
  
  // Canvas contexts
  private gameCtx!: CanvasRenderingContext2D;
  private effectsCtx!: CanvasRenderingContext2D;
  
  // Animation control
  private animationId?: number;
  private lastFrameTime = 0;
  
  // Canvas dimensions (ajustado a especificación 550x550 de referenciaDiseño)
  public readonly canvasWidth = 550;
  public readonly canvasHeight = 550;
  
  // State signals
  public readonly gameState = this.gameEngine.gameState;
  public readonly player = this.gameEngine.player;
  public readonly obstacles = this.gameEngine.obstacles;
  public readonly powerUps = this.gameEngine.powerUps;
  public readonly fps = this.gameEngine.fps;
  public readonly isPlaying = this.gameEngine.isPlaying;
  
  // Component state
  public readonly debugMode = signal(false);
  public readonly particleCount = signal(0);
  public readonly isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Zen wave system (inspired by Hokusai and Abbott)
  private waveField!: Float32Array;
  private waveSources: WaveSource[] = [];
  private waveTime = 0;
  private readonly waveResolution = 4;
  private readonly fieldWidth = Math.ceil(this.canvasWidth / this.waveResolution);
  private readonly fieldHeight = Math.ceil(this.canvasHeight / this.waveResolution);
  
  // Inside-out particle system
  private particles: ZenParticle[] = [];
  private readonly maxParticles = 100; // Reducido de 2000 a 100 para mejor rendimiento
  
  // Sistema de espiral interactivo mejorado
  private spiralConfig = {
    centerX: this.canvasWidth / 2,
    centerY: this.canvasHeight / 2,
    maxParticles: 200, // Reducido de 2500 a 200 para mejor rendimiento
    minRadius: 5,
    maxRadius: 250,
    baseSpeed: 0.5,
    twistStrength: 2.0,
    expansionRate: 0.8,
    interactionRadius: 100,
    particleLifespan: 300
  };

  // Sistema de puntuación
  private score = 0;
  private combo = 0;
  private stability = 1.0;
  private lastInteractionTime = 0;

  // Modos de juego
  private gameMode: 'zen' | 'flow' | 'challenge' = 'zen';
  private challengeTimer = 0;
  private challengeIntensity = 0;
  
  // SVG sprite cache
  private svgCache = new Map<string, HTMLImageElement>();
  
  constructor() {
    // React to game state changes
    effect(() => {
      // Siempre correr animación (modo idle en menú, activo en juego)
      const playing = this.isPlaying();
      if (!this.animationId) {
        this.startRenderLoop();
      }
      if (playing && this.particles.length === 0) {
        this.initializeWaveSystem();
        this.initializeParticleSystem();
      }
    });
  }
  
  ngAfterViewInit(): void {
    // Eliminar logs innecesarios para mejorar rendimiento
    this.initializeCanvas();
    this.loadSVGSprites();
    this.setupEventListeners();
    
    // Inicializar sistemas inmediatamente
    this.initializeWaveSystem();
    this.initializeParticleSystem();
  }
  
  ngOnDestroy(): void {
    this.stopRenderLoop();
    this.cleanup();
  }
  
  /**
   * Inicializar contextos de canvas
   */
  private initializeCanvas(): void {
    console.log('🎨 Inicializando canvas...');
    console.log('Canvas elements:', this.gameCanvas, this.effectsCanvas);
    
    this.gameCtx = this.gameCanvas.nativeElement.getContext('2d')!;
    this.effectsCtx = this.effectsCanvas.nativeElement.getContext('2d')!;
    
    console.log('Game context:', this.gameCtx);
    console.log('Effects context:', this.effectsCtx);
    console.log('Canvas dimensions:', this.canvasWidth, this.canvasHeight);
    
    // Configurar contextos
    [this.gameCtx, this.effectsCtx].forEach(ctx => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    });
    
    // Inicializar campo de ondas
    this.waveField = new Float32Array(this.fieldWidth * this.fieldHeight);
    
    // Test de renderizado inmediato
    this.testCanvasRendering();
  }
  
  /**
   * Test básico de renderizado para verificar que los contextos funcionan
   */
  private testCanvasRendering(): void {
    console.log('🧪 Ejecutando test de renderizado...');
    
    try {
      // Test en effects canvas
      this.effectsCtx.fillStyle = '#FF0000';
      this.effectsCtx.fillRect(10, 10, 50, 50);
      console.log('✅ Effects canvas: rectángulo rojo dibujado');
      
      // Test en game canvas
      this.gameCtx.fillStyle = '#00FF00';
      this.gameCtx.fillRect(70, 10, 50, 50);
      console.log('✅ Game canvas: rectángulo verde dibujado');
      
      // Test de texto
      this.gameCtx.fillStyle = '#FFFFFF';
      this.gameCtx.font = '16px Arial';
      this.gameCtx.fillText('Test Canvas', 10, 100);
      console.log('✅ Game canvas: texto dibujado');
      
    } catch (error) {
      console.error('❌ Error en test de renderizado:', error);
    }
  }
  
  /**
   * Cargar sprites SVG con fallback embebido
   */
  private async loadSVGSprites(): Promise<void> {
    const sprites = [
      { name: 'player', url: '/assets/svg/player.svg' },
      { name: 'obstacles', url: '/assets/svg/obstacles.svg' },
      { name: 'powerups', url: '/assets/svg/powerups.svg' },
      { name: 'particles', url: '/assets/svg/particles.svg' },
      // Nuevos sprites críticos
      { name: 'energy-spark', url: '/assets/particles/energy-spark.svg' },
      { name: 'wave-particle', url: '/assets/particles/wave-particle.svg' },
      { name: 'background-pattern', url: '/assets/textures/background-pattern.svg' },
      { name: 'glow-radial', url: '/assets/effects/glow-radial.svg' },
      { name: 'button-normal', url: '/assets/ui/button-normal.svg' },
      { name: 'zen-bg', url: '/assets/backgrounds/zen-mode-bg.svg' }
    ];
    
    for (const sprite of sprites) {
      try {
        const img = new Image();
        img.src = sprite.url;
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log(`✅ Loaded sprite: ${sprite.name}`);
            resolve(void 0);
          };
          img.onerror = (error) => {
            console.warn(`⚠️ Failed to load sprite: ${sprite.name}, using ZenIcon fallback`);
            reject(error);
          };
        });
        this.svgCache.set(sprite.name, img);
      } catch (error) {
        // Usar ZenIconService como fallback
        await this.createZenIconFallback(sprite.name);
      }
    }
    
    console.log('🎨 Total sprites loaded:', this.svgCache.size);
  }
  
  /**
   * Crear sprites usando ZenIconService como fallback
   */
  private async createZenIconFallback(name: string): Promise<void> {
    try {
      let svgString = '';
      
      switch (name) {
        case 'player':
          svgString = this.zenIconService.createSVGString('player', 'primary', 60, '#A8E6CF');
          break;
        case 'obstacles':
          svgString = this.zenIconService.createSVGString('obstacles', 'circle', 60, '#FF6B6B');
          break;
        case 'powerups':
          svgString = this.zenIconService.createSVGString('powerups', 'energy', 60, '#4ECDC4');
          break;
        case 'particles':
          svgString = this.zenIconService.createSVGString('particles', 'sparkle', 20, '#A8E6CF');
          break;
      }
      
      if (svgString) {
        const img = await this.zenIconService.svgStringToImage(svgString);
        this.svgCache.set(name, img);
        console.log(`✅ Created ZenIcon fallback for: ${name}`);
      }
    } catch (error) {
      console.warn(`⚠️ ZenIcon fallback failed for: ${name}, using canvas fallback`);
      this.createFallbackSprite(name);
    }
  }
  
  /**
   * Crear sprites SVG embebidos como fallback
   */
  private createFallbackSprite(name: string): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 60;
    canvas.height = 60;
    
    // Limpiar canvas
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 60, 60);
    
    switch (name) {
      case 'player':
        this.drawFallbackPlayer(ctx);
        break;
      case 'obstacles':
        this.drawFallbackObstacle(ctx);
        break;
      case 'powerups':
        this.drawFallbackPowerUp(ctx);
        break;
      case 'particles':
        this.drawFallbackParticle(ctx);
        break;
    }
    
    // Convertir a imagen
    const img = new Image();
    img.src = canvas.toDataURL();
    this.svgCache.set(name, img);
  }
  
  /**
   * Dibujar jugador fallback
   */
  private drawFallbackPlayer(ctx: CanvasRenderingContext2D): void {
    const centerX = 30;
    const centerY = 30;
    
    // Glow externo
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 28);
    gradient.addColorStop(0, 'rgba(168, 230, 207, 0.9)');
    gradient.addColorStop(0.7, 'rgba(78, 205, 196, 0.6)');
    gradient.addColorStop(1, 'rgba(46, 139, 126, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
    ctx.fill();
    
    // Núcleo interno
    ctx.fillStyle = '#4ECDC4';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Símbolo zen
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☯', centerX, centerY);
  }
  
  /**
   * Dibujar obstáculo fallback
   */
  private drawFallbackObstacle(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 60, 60);
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(1, '#C44569');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(10, 10, 40, 40);
    
    ctx.strokeStyle = '#C44569';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 40, 40);
  }
  
  /**
   * Dibujar power-up fallback
   */
  private drawFallbackPowerUp(ctx: CanvasRenderingContext2D): void {
    const centerX = 30;
    const centerY = 30;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 18);
    gradient.addColorStop(0, '#4ECDC4');
    gradient.addColorStop(1, 'rgba(78, 205, 196, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', centerX, centerY);
  }
  
  /**
   * Dibujar partícula fallback
   */
  private drawFallbackParticle(ctx: CanvasRenderingContext2D): void {
    const centerX = 30;
    const centerY = 30;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 5);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(1, 'rgba(168, 230, 207, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Configurar event listeners
   */
  private setupEventListeners(): void {
    // Teclado
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Detectar modo debug
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.debugMode.update(debug => !debug);
      }
    });
  }
  
  /**
   * Inicializar sistema de ondas zen (basado en referencia de diseño)
   */
  private initializeWaveSystem(): void {
    this.waveSources = [];
    
    // Fuentes en espiral (5 fuentes en 1.5 vueltas)
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    const spiralTurns = 1.5;
    const sourceCount = 5;
    
    for (let i = 0; i < sourceCount; i++) {
      const t = i / sourceCount;
      const angle = t * Math.PI * 2 * spiralTurns;
      const radius = 100 + t * 150; // 100-250px radius
      
      this.waveSources.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        frequency: 0.02 + t * 0.01, // Frecuencias gradualmente diferentes
        amplitude: 1.0,
        wavelength: 60 + t * 30, // 60-90px wavelengths
        phase: t * Math.PI
      });
    }
    
    // Fuente central
    this.waveSources.push({
      x: centerX,
      y: centerY,
      frequency: 0.015,
      amplitude: 1.5,
      wavelength: 75,
      phase: 0
    });
  }
  
  /**
   * Inicializar sistema de partículas inside-out vortex
   */
  private initializeParticleSystem(): void {
    this.particles = [];
    
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createZenParticle(i));
    }
    
    this.particleCount.set(this.particles.length);
  }
  
  /**
   * Crear partícula zen con patrón inside-out vortex
   */
  private createZenParticle(index: number): ZenParticle {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    
    // Distribución inside-out: emanar desde el centro
    const t = Math.random();
    const angle = t * Math.PI * 20; // Múltiples rotaciones para efecto espiral
    
    // Radio invertido: pequeño en el centro, expandiéndose hacia afuera
    const radius = 0.1 + t * 200;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return {
      x, y,
      originalRadius: radius,
      angle,
      speed: 0.3 + Math.random() * 0.3,
      size: 0.08 - t * 0.05, // Más grandes en el centro
      opacity: 1.0 - t * 0.7, // Más opacos en el centro
      index,
      life: 1.0,
      color: this.getParticleColor(t)
    };
  }
  
  /**
   * Obtener color de partícula basado en posición
   */
  private getParticleColor(t: number): string {
    const hue = 180 + t * 60; // Verde-azul zen
    const saturation = 70 - t * 20;
    const lightness = 80 - t * 30;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  
  /**
   * Iniciar loop de renderizado
   */
  private startRenderLoop(): void {
    if (this.animationId) return;
    
    const render = (currentTime: number) => {
      const deltaTime = (currentTime - this.lastFrameTime) / 1000;
      this.lastFrameTime = currentTime;
      
      this.updateWaveSystem(deltaTime);
      this.updateParticleSystem(deltaTime);
      this.render();
      
      this.animationId = requestAnimationFrame(render);
    };
    
    this.animationId = requestAnimationFrame(render);
  }
  
  /**
   * Detener loop de renderizado
   */
  private stopRenderLoop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }
  
  /**
   * Renderizar frame completo
   */
  private render(): void {
    // Eliminar console.logs para mejorar rendimiento
    this.clearCanvas();
    this.renderZenWaves();
    this.renderParticles();
    this.renderGameObjects();
    this.renderIdleOverlay();
    
    this.renderHUD();
    console.log('📊 HUD renderizado');
    
    this.renderGameModeInfo();
    console.log('ℹ️ Información de modo renderizada');
  }
  
  /**
   * Actualizar sistema de ondas zen
   */
  private updateWaveSystem(deltaTime: number): void {
    this.waveTime += deltaTime * 0.00075; // Incremento temporal según referencia
    
    // Limpiar campo
    this.waveField.fill(0);
    
    // Calcular interferencia de ondas
    for (let y = 0; y < this.fieldHeight; y++) {
      for (let x = 0; x < this.fieldWidth; x++) {
        const worldX = x * this.waveResolution;
        const worldY = y * this.waveResolution;
        let totalAmplitude = 0;
        
        for (const source of this.waveSources) {
          const dx = worldX - source.x;
          const dy = worldY - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Falloff exponencial
          const falloff = Math.exp(-distance / 250);
          
          // Onda sinusoidal
          const wave = Math.sin((distance / source.wavelength) * Math.PI * 2 + 
                               this.waveTime * source.frequency + source.phase);
          
          totalAmplitude += wave * source.amplitude * falloff;
        }
        
        this.waveField[y * this.fieldWidth + x] = totalAmplitude;
      }
    }
  }
  
  /**
   * Actualizar sistema de partículas con interacciones mejoradas
   */
  private updateParticleSystem(deltaTime: number): void {
    const time = this.waveTime * 10; // Acelerar para partículas
    
    for (const particle of this.particles) {
      // Movimiento inside-out vortex mejorado
      const centerX = this.canvasWidth / 2;
      const centerY = this.canvasHeight / 2;
      
      // Calcular distancia al centro
      const dx = particle.x - centerX;
      const dy = particle.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Fuerza centrípeta (atrae hacia el centro)
      const centerForce = 0.1;
      const centerAccelX = -dx * centerForce / distance;
      const centerAccelY = -dy * centerForce / distance;
      
      // Twist dinámico basado en modo de juego
      let twistAmount = Math.sin(time * 0.4) * this.spiralConfig.twistStrength;
      if (this.gameMode === 'challenge') {
        twistAmount *= (1 + this.challengeIntensity);
      }
      
      const twist = (200 - distance) * twistAmount * 0.001;
      
      // Aplicar rotación y expansión desde el centro
      particle.angle += twist;
      const breathe = 1.0 + Math.sin(time * 0.6) * this.spiralConfig.expansionRate;
      particle.originalRadius *= breathe;
      
      // Aplicar fuerzas de interacción del usuario
      const interactionForce = this.calculateInteractionForce(particle, time);
      
      // Actualizar posición con física mejorada
      particle.x += centerAccelX * deltaTime * 50;
      particle.y += centerAccelY * deltaTime * 50;
      particle.x += interactionForce.x * deltaTime * 100;
      particle.y += interactionForce.y * deltaTime * 100;
      
      // Mantener dentro de límites
      const maxDist = this.spiralConfig.maxRadius;
      if (distance > maxDist) {
        const angle = Math.atan2(dy, dx);
        particle.x = centerX + Math.cos(angle) * maxDist;
        particle.y = centerY + Math.sin(angle) * maxDist;
      }
      
      // Actualizar propiedades visuales
      particle.life *= 0.999;
      particle.opacity = Math.min(1.0, particle.opacity * 0.995);
      
      // Resetear si está muy lejos o muy débil
      if (particle.originalRadius > 400 || particle.life < 0.1) {
        Object.assign(particle, this.createZenParticle(particle.index));
      }
    }
    
    // Actualizar métricas de estabilidad
    this.updateStabilityMetrics();
  }
  
  /**
   * Calcular fuerza de interacción basada en input del usuario
   */
  private calculateInteractionForce(particle: ZenParticle, time: number): { x: number; y: number } {
    let forceX = 0;
    let forceY = 0;
    
    // Simular fuerza basada en tiempo desde última interacción
    const timeSinceInteraction = time - this.lastInteractionTime;
    const interactionDecay = Math.max(0, 1 - timeSinceInteraction * 0.01);
    
    if (interactionDecay > 0) {
      // Fuerza radial desde el centro
      const centerX = this.canvasWidth / 2;
      const centerY = this.canvasHeight / 2;
      const dx = particle.x - centerX;
      const dy = particle.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Fuerza de expansión/contracción basada en modo
      const expansionForce = this.gameMode === 'flow' ? 0.5 : -0.3;
      const radialForce = expansionForce * interactionDecay * (distance / 200);
      
      forceX = (dx / distance) * radialForce;
      forceY = (dy / distance) * radialForce;
      
      // Añadir componente tangencial para twist
      const tangentialForce = this.gameMode === 'challenge' ? 0.2 : 0.1;
      forceX += (-dy / distance) * tangentialForce * interactionDecay;
      forceY += (dx / distance) * tangentialForce * interactionDecay;
    }
    
    return { x: forceX, y: forceY };
  }
  
  /**
   * Actualizar métricas de estabilidad del sistema
   */
  private updateStabilityMetrics(): void {
    let totalStability = 0;
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    
    for (const particle of this.particles) {
      const dx = particle.x - centerX;
      const dy = particle.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Estabilidad basada en distancia ideal y vida de partícula
      const idealDistance = particle.originalRadius;
      const distanceStability = 1 - Math.abs(distance - idealDistance) / idealDistance;
      const lifeStability = particle.life;
      
      totalStability += distanceStability * lifeStability;
    }
    
    this.stability = totalStability / this.particles.length;
    
    // Actualizar puntuación basada en estabilidad
    if (this.stability > 0.8) {
      this.score += Math.floor(this.stability * 10);
      this.combo++;
    } else {
      this.combo = 0;
    }
    
    // Modo challenge: aumentar intensidad con el tiempo
    if (this.gameMode === 'challenge') {
      this.challengeTimer += 0.016; // ~60 FPS
      this.challengeIntensity = Math.min(2.0, this.challengeTimer * 0.01);
    }
  }  /**
   * Limpiar canvas
   */
  private clearCanvas(): void {
    // Fondo dinámico: beige washi en menú con ligera textura, profundo en juego
    if (this.isPlaying()) {
      this.effectsCtx.fillStyle = '#0f1624';
    } else {
      // degradado suave tipo papel washi
      const gradient = this.effectsCtx.createLinearGradient(0,0,0,this.canvasHeight);
      gradient.addColorStop(0,'#F5F3EB');
      gradient.addColorStop(1,'#E9E6DE');
      this.effectsCtx.fillStyle = gradient;
    }
    this.effectsCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Limpiar canvas de juego
    this.gameCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }
  
  /**
   * Renderizar ondas zen (inspirado en Hokusai y Abbott)
   */
  private renderZenWaves(): void {
    // En menú dibujamos ondas más sutiles (idle)
    const playing = this.isPlaying();
    if (!playing) {
      this.effectsCtx.globalAlpha = 0.25;
    }
    
  this.effectsCtx.strokeStyle = playing ? '#2f3b52' : '#777';
  this.effectsCtx.lineWidth = playing ? 1.2 : 0.8;
  this.effectsCtx.globalAlpha = playing ? 0.55 : 0.25;
    
    // Contornos de nivel (solo 2 niveles: -0.2 y 0.2)
    const levels = [-0.2, 0.2];
    
    for (const level of levels) {
      this.effectsCtx.beginPath();
      
      for (let y = 0; y < this.fieldHeight - 1; y++) {
        for (let x = 0; x < this.fieldWidth - 1; x++) {
          const val1 = this.waveField[y * this.fieldWidth + x];
          const val2 = this.waveField[y * this.fieldWidth + x + 1];
          const val3 = this.waveField[(y + 1) * this.fieldWidth + x];
          
          // Detección de contorno simple
          if ((val1 <= level && val2 >= level) || (val1 >= level && val2 <= level) ||
              (val1 <= level && val3 >= level) || (val1 >= level && val3 <= level)) {
            
            const worldX = x * this.waveResolution;
            const worldY = y * this.waveResolution;
            
            this.effectsCtx.moveTo(worldX, worldY);
            this.effectsCtx.lineTo(worldX + this.waveResolution, worldY);
          }
        }
      }
      
      this.effectsCtx.stroke();
    }
    
    this.effectsCtx.globalAlpha = 1.0;
  }
  
  /**
   * Renderizar partículas inside-out vortex
   */
  private renderParticles(): void {
    // Eliminar console.logs para mejorar rendimiento
    
    // También mostrar partículas en menú (menos intensas)
    const playing = this.isPlaying();
    if (!playing) {
      this.effectsCtx.globalAlpha = 0.35;
    }
    
    this.effectsCtx.globalCompositeOperation = 'screen'; // Blending aditivo
    
    let renderedCount = 0;
    for (const particle of this.particles) {
      if (particle.life <= 0) continue;
      
      this.effectsCtx.globalAlpha = particle.opacity * particle.life;
      this.effectsCtx.fillStyle = particle.color;
      
      // Intentar usar sprite SVG si está disponible
      const spriteName = this.getParticleSpriteName(particle);
      const sprite = this.svgCache.get(spriteName);
      
      if (sprite && sprite.complete) {
        // Renderizar usando sprite SVG
        const size = particle.size * 60; // Escalar para mejor visibilidad
        this.effectsCtx.drawImage(
          sprite,
          particle.x - size/2,
          particle.y - size/2,
          size,
          size
        );
      } else {
        // Fallback a círculos
        this.effectsCtx.beginPath();
        this.effectsCtx.arc(particle.x, particle.y, particle.size * 20, 0, Math.PI * 2);
        this.effectsCtx.fill();
      }
      
      renderedCount++;
    }
    
    // Actualizar el contador de partículas sin usar console.log
    this.particleCount.set(renderedCount);
    
    this.effectsCtx.globalCompositeOperation = 'source-over';
    this.effectsCtx.globalAlpha = 1.0;
  }
  
  /**
   * Obtener el nombre del sprite apropiado para una partícula
   */
  private getParticleSpriteName(particle: ZenParticle): string {
    // Lógica para seleccionar sprite basado en propiedades de la partícula
    if (particle.size > 0.05) {
      return 'energy-spark'; // Partículas grandes usan energy-spark
    } else if (particle.angle % 2 === 0) {
      return 'wave-particle'; // Partículas pares usan wave-particle
    } else {
      return 'particles'; // Fallback al sprite base
    }
  }
  
  /**
   * Renderizar objetos del juego (jugador, obstáculos, power-ups)
   */
  private renderGameObjects(): void {
    if (!this.isPlaying()) {
      // Mostrar jugador con animación de latido ligero en centro
      const p = this.player();
      const pulse = 1 + Math.sin(this.waveTime * 6) * 0.05;
      const cloned: Player = { ...p, position: { x: this.canvasWidth/2, y: this.canvasHeight/2 } as any, radius: p.radius * pulse } as any;
      this.renderPlayer(cloned);
      return;
    }
    // Renderizar jugador activo
    this.renderPlayer(this.player());
    
    // Renderizar obstáculos
    for (const obstacle of this.obstacles()) {
      this.renderObstacle(obstacle);
    }
    
    // Renderizar power-ups
    for (const powerUp of this.powerUps()) {
      this.renderPowerUp(powerUp);
    }
  }
  
  /**
   * Renderizar jugador
   */
  private renderPlayer(player: Player): void {
    const { position, radius, energy, maxEnergy } = player;
    
    // Glow energy-based
    const energyRatio = energy / maxEnergy;
    this.gameCtx.shadowColor = '#A8E6CF';
    this.gameCtx.shadowBlur = 15 * energyRatio;
    
    // Círculo principal
    this.gameCtx.fillStyle = `rgba(168, 230, 207, ${0.8 * energyRatio})`;
    this.gameCtx.beginPath();
    this.gameCtx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.gameCtx.fill();
    
    // Núcleo interno
    this.gameCtx.fillStyle = '#4ECDC4';
    this.gameCtx.beginPath();
    this.gameCtx.arc(position.x, position.y, radius * 0.6, 0, Math.PI * 2);
    this.gameCtx.fill();
    
    // Símbolo zen
    this.gameCtx.fillStyle = '#FFF';
    this.gameCtx.font = `${radius}px Arial`;
    this.gameCtx.textAlign = 'center';
    this.gameCtx.textBaseline = 'middle';
    this.gameCtx.fillText('☯', position.x, position.y);
    
    // Reset shadow
    this.gameCtx.shadowBlur = 0;
  }

  /**
   * Overlay informativo cuando el juego está en menú (idle)
   */
  private renderIdleOverlay(): void {
    if (this.isPlaying()) return;
    const ctx = this.gameCtx;
    ctx.save();
    ctx.globalAlpha = 0.85;
    const gradient = ctx.createLinearGradient(0, this.canvasHeight - 120, 0, this.canvasHeight);
    gradient.addColorStop(0, 'rgba(15,22,36,0.0)');
    gradient.addColorStop(1, 'rgba(15,22,36,0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, this.canvasHeight - 120, this.canvasWidth, 120);
    ctx.fillStyle = '#DFFFF7';
    ctx.font = '12px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 4;
    ctx.fillText('Modo idle — Sistema de Espiral Interactivo Zen Flow', this.canvasWidth/2, this.canvasHeight - 100);
    ctx.fillText('Space/Click = Impulso | 1=Zen | 2=Flow | 3=Challenge | F1=Debug', this.canvasWidth/2, this.canvasHeight - 80);
    ctx.fillText('Observa cómo las partículas danzan en patrones espirales de energía', this.canvasWidth/2, this.canvasHeight - 60);
    ctx.fillText('Cada modo ofrece una experiencia única de meditación y juego', this.canvasWidth/2, this.canvasHeight - 40);
    ctx.restore();
  }

  /**
   * HUD básico (energía y puntuación)
   */
  private renderHUD(): void {
    const pl = this.player();
    const ctx = this.gameCtx;
    ctx.save();
    // Barra energía
    const barWidth = 160;
    const barHeight = 12;
    const x = 20; const y = 20;
    ctx.fillStyle = 'rgba(15,22,36,0.55)';
    ctx.roundRect?.(x-4, y-4, barWidth+8, barHeight+8, 6);
    if(!ctx.roundRect){ ctx.fillRect(x-4, y-4, barWidth+8, barHeight+8);} else { ctx.fill(); }
    ctx.fillStyle = '#1e2b40'; ctx.fillRect(x, y, barWidth, barHeight);
    const ratio = pl.energy / pl.maxEnergy;
    const grd = ctx.createLinearGradient(x, y, x+barWidth, y);
    grd.addColorStop(0,'#4ECDC4'); grd.addColorStop(1,'#A8E6CF');
    ctx.fillStyle = grd; ctx.fillRect(x, y, barWidth*ratio, barHeight);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.strokeRect(x, y, barWidth, barHeight);
    ctx.fillStyle = '#E7FFF7'; ctx.font = '11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(`${pl.energy}/${pl.maxEnergy}`, x+barWidth/2, y+barHeight/2);
    // Puntuación
    ctx.textAlign='right'; ctx.font='14px Inter'; ctx.fillStyle='#FFD93D';
    ctx.fillText(`Score ${this.score}`, this.canvasWidth-24, 30);
    ctx.restore();
  }
  
  /**
   * Renderizar información del modo de juego
   */
  private renderGameModeInfo(): void {
    const ctx = this.gameCtx;
    ctx.save();
    
    // Información del modo
    ctx.fillStyle = 'rgba(15,22,36,0.8)';
    ctx.fillRect(20, this.canvasHeight - 120, 200, 100);
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, this.canvasHeight - 120, 200, 100);
    
    ctx.fillStyle = '#E7FFF7';
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    let modeText = '';
    let modeDesc = '';
    
    switch (this.gameMode) {
      case 'zen':
        modeText = 'Modo Zen ☯';
        modeDesc = 'Mantén la estabilidad del vórtice';
        break;
      case 'flow':
        modeText = 'Modo Flow 🌊';
        modeDesc = 'Crea patrones dinámicos';
        break;
      case 'challenge':
        modeText = 'Modo Desafío ⚡';
        modeDesc = 'Sobrevive las perturbaciones';
        break;
    }
    
    ctx.fillText(modeText, 30, this.canvasHeight - 110);
    ctx.fillText(`Estabilidad: ${(this.stability * 100).toFixed(1)}%`, 30, this.canvasHeight - 90);
    ctx.fillText(`Combo: ${this.combo}`, 30, this.canvasHeight - 70);
    ctx.fillText(modeDesc, 30, this.canvasHeight - 50);
    
    if (this.gameMode === 'challenge') {
      ctx.fillText(`Intensidad: ${(this.challengeIntensity * 100).toFixed(1)}%`, 30, this.canvasHeight - 30);
    }
    
    ctx.restore();
  }
  
  /**
   * Renderizar obstáculo
   */
  private renderObstacle(obstacle: Obstacle): void {
    const { position, size, shape, color, opacity, rotation } = obstacle;
    
    this.gameCtx.save();
    this.gameCtx.translate(position.x, position.y);
    this.gameCtx.rotate(rotation);
    this.gameCtx.globalAlpha = opacity;
    
    this.gameCtx.fillStyle = color;
    this.gameCtx.strokeStyle = '#C44569';
    this.gameCtx.lineWidth = 2;
    
    switch (shape) {
      case 'rectangle':
        this.gameCtx.fillRect(-size.width/2, -size.height/2, size.width, size.height);
        this.gameCtx.strokeRect(-size.width/2, -size.height/2, size.width, size.height);
        break;
        
      case 'circle':
        const radius = Math.min(size.width, size.height) / 2;
        this.gameCtx.beginPath();
        this.gameCtx.arc(0, 0, radius, 0, Math.PI * 2);
        this.gameCtx.fill();
        this.gameCtx.stroke();
        break;
        
      case 'triangle':
        this.gameCtx.beginPath();
        this.gameCtx.moveTo(0, -size.height/2);
        this.gameCtx.lineTo(-size.width/2, size.height/2);
        this.gameCtx.lineTo(size.width/2, size.height/2);
        this.gameCtx.closePath();
        this.gameCtx.fill();
        this.gameCtx.stroke();
        break;
        
      case 'ring':
        const outerRadius = Math.min(size.width, size.height) / 2;
        const innerRadius = outerRadius * 0.6;
        this.gameCtx.beginPath();
        this.gameCtx.arc(0, 0, outerRadius, 0, Math.PI * 2);
        this.gameCtx.arc(0, 0, innerRadius, 0, Math.PI * 2, true);
        this.gameCtx.fill();
        break;
    }
    
    this.gameCtx.restore();
  }
  
  /**
   * Renderizar power-up con iconos dinámicos
   */
  private renderPowerUp(powerUp: PowerUp): void {
    const { position, radius, color, type, opacity } = powerUp;
    
    // Animación de pulsación
    const pulse = 1 + Math.sin(this.waveTime * 10) * 0.2;
    const effectiveRadius = radius * pulse;
    
    this.gameCtx.save();
    this.gameCtx.globalAlpha = opacity;
    
    // Glow effect
    this.gameCtx.shadowColor = color;
    this.gameCtx.shadowBlur = 20;
    
    // Círculo principal
    this.gameCtx.fillStyle = color;
    this.gameCtx.beginPath();
    this.gameCtx.arc(position.x, position.y, effectiveRadius, 0, Math.PI * 2);
    this.gameCtx.fill();
    
    // Símbolo del tipo usando ZenIconService o fallback
    this.gameCtx.shadowBlur = 0;
    this.gameCtx.fillStyle = '#FFF';
    this.gameCtx.font = `${effectiveRadius}px Arial`;
    this.gameCtx.textAlign = 'center';
    this.gameCtx.textBaseline = 'middle';
    
    const symbol = this.getPowerUpSymbol(type);
    this.gameCtx.fillText(symbol, position.x, position.y);
    
    // Efecto adicional de partículas para power-ups especiales
    if (type === 'zen' || type === 'multipler') {
      this.renderPowerUpParticles(position, effectiveRadius, color);
    }
    
    this.gameCtx.restore();
  }
  
  /**
   * Renderizar partículas adicionales para power-ups especiales
   */
  private renderPowerUpParticles(position: { x: number; y: number }, radius: number, color: string): void {
    const particleCount = 6;
    const time = this.waveTime * 5;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time;
      const distance = radius + 10 + Math.sin(time + i) * 5;
      
      const x = position.x + Math.cos(angle) * distance;
      const y = position.y + Math.sin(angle) * distance;
      
      this.gameCtx.fillStyle = color;
      this.gameCtx.globalAlpha = 0.6;
      this.gameCtx.beginPath();
      this.gameCtx.arc(x, y, 2, 0, Math.PI * 2);
      this.gameCtx.fill();
    }
  }
  
  /**
   * Obtener símbolo para tipo de power-up
   */
  private getPowerUpSymbol(type: string): string {
    switch (type) {
      case 'energy': return '⚡';
      case 'score': return '★';
      case 'shield': return '🛡';
      case 'zen': return '☯';
      case 'multipler': return '×';
      default: return '○';
    }
  }
  
  /**
   * Manejar input del teclado con modos de juego
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      this.handlePlayerInput();
    }
    
    // Cambiar modos de juego
    if (event.key === '1') {
      this.gameMode = 'zen';
      this.resetGameMode();
    } else if (event.key === '2') {
      this.gameMode = 'flow';
      this.resetGameMode();
    } else if (event.key === '3') {
      this.gameMode = 'challenge';
      this.resetGameMode();
    }
    
    // Toggle debug mode
    if (event.key === 'F1') {
      event.preventDefault();
      this.debugMode.update(debug => !debug);
    }
  }
  
  /**
   * Resetear parámetros al cambiar modo de juego
   */
  private resetGameMode(): void {
    this.challengeTimer = 0;
    this.challengeIntensity = 0;
    this.stability = 1.0;
    this.combo = 0;
    
    // Resetear configuración del espiral
    this.spiralConfig.twistStrength = 2.0;
    this.spiralConfig.expansionRate = 0.8;
    
    // Efectos visuales de transición
    this.applyModeTransition();
  }
  
  /**
   * Aplicar efectos de transición al cambiar modo
   */
  private applyModeTransition(): void {
    // Aumentar brevemente la opacidad de todas las partículas
    for (const particle of this.particles) {
      particle.opacity = Math.min(1.0, particle.opacity + 0.3);
    }
    
    // Reset después de transición
    setTimeout(() => {
      for (const particle of this.particles) {
        particle.opacity = Math.max(0.1, particle.opacity - 0.3);
      }
    }, 300);
  }
  
  /**
   * Manejar click en canvas
   */
  public handleCanvasClick(event: MouseEvent): void {
  if (event.cancelable) event.preventDefault();
    this.handlePlayerInput();
  }
  
  /**
   * Manejar touch start
   */
  public handleTouchStart(event: TouchEvent): void {
  if (event.cancelable) event.preventDefault();
    this.handlePlayerInput(event);
  }
  
  /**
   * Manejar touch end
   */
  public handleTouchEnd(event: TouchEvent): void {
  if (event.cancelable) event.preventDefault();
  }
  
  /**
   * Procesar input del jugador con sistema de espiral mejorado
   */
  public handlePlayerInput(event?: Event): void {
    if (event) {
      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
    }
    
    // Registrar interacción para el sistema de partículas
    this.lastInteractionTime = this.waveTime * 10;
    
    // Aumentar intensidad de interacción
    this.challengeIntensity = Math.min(3.0, this.challengeIntensity + 0.1);
    
    // Aplicar efecto de impulso al sistema de partículas
    this.applySpiralImpulse();
    
    // Llamar al input del game engine
    this.gameEngine.handlePlayerInput();
  }
  
  /**
   * Aplicar impulso al sistema de espiral
   */
  private applySpiralImpulse(): void {
    // Aumentar la expansión temporalmente
    this.spiralConfig.expansionRate += 0.2;
    
    // Reset después de un tiempo
    setTimeout(() => {
      this.spiralConfig.expansionRate = Math.max(0.8, this.spiralConfig.expansionRate - 0.2);
    }, 500);
    
    // Aumentar twist para modo flow
    if (this.gameMode === 'flow') {
      this.spiralConfig.twistStrength += 0.5;
      setTimeout(() => {
        this.spiralConfig.twistStrength = Math.max(2.0, this.spiralConfig.twistStrength - 0.5);
      }, 1000);
    }
  }
  
  /**
   * Limpieza de memoria
   */
  private cleanup(): void {
    this.waveField = new Float32Array(0);
    this.waveSources = [];
    this.particles = [];
    this.svgCache.clear();
  }
}

/**
 * Interfaces para el sistema zen
 */
interface WaveSource {
  x: number;
  y: number;
  frequency: number;
  amplitude: number;
  wavelength: number;
  phase: number;
}

interface ZenParticle {
  x: number;
  y: number;
  originalRadius: number;
  angle: number;
  speed: number;
  size: number;
  opacity: number;
  index: number;
  life: number;
  color: string;
}
