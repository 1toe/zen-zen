import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameEngineService } from './services';
import { GameCanvasComponent } from './components/game-canvas/game-canvas.component';
import { GameState, GameMode, Difficulty } from './models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, GameCanvasComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Zen Flow';
  
  // Inyección del servicio del motor de juego
  private gameEngine = inject(GameEngineService);
  
  // Exposición de signals para el template
  public readonly gameState = this.gameEngine.gameState;
  public readonly player = this.gameEngine.player;
  public readonly fps = this.gameEngine.fps;
  public readonly isPlaying = this.gameEngine.isPlaying;
  
  // Configuración del mockup
  public showSettings = false;
  public particleDensity = 0.6;
  public showTrails = true;
  public enableGlow = true;
  public audioVolume = 0.7;
  public enableSound = true;
  public gameDifficulty = 'normal';
  
  // Estadísticas del juego
  private highScore = 0;
  private totalSessions = 0;
  private totalZenTime = 0;
  
  ngOnInit(): void {
    // Cargar configuración y estadísticas guardadas
    this.loadSettings();
    this.loadStats();
    
    // Suscribirse a eventos del juego para logging
    this.gameEngine.gameEvents$.subscribe(event => {
      console.log('Game Event:', event.type, event.data);
    });
    
    // Configurar controles touch/click para dispositivos móviles
    this.setupInputControls();
    
    // Inicializar con configuración por defecto
    console.log('Zen Flow initialized');
    console.log('Current game state:', this.gameState());
    console.log('Player initial state:', this.player());
  }
  
  /**
   * Inicia el modo challenge
   */
  public startChallengeGame(): void {
    console.log('Starting Challenge Mode');
    this.gameEngine.startGame({
      mode: GameMode.NORMAL,
      difficulty: Difficulty.HARD
    });
    this.totalSessions++;
    this.saveStats();
  }
  
  /**
   * Toggle del panel de configuración
   */
  public toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }
  
  /**
   * Muestra el tutorial
   */
  public showTutorial(): void {
    alert('Tutorial: Usa Space/Click para interactuar con el vórtice. Mantén la estabilidad en Modo Zen, crea patrones en Modo Flow, y sobrevive en Modo Challenge. ¡Encuentra tu flujo zen!');
  }
  
  /**
   * Obtiene la puntuación más alta
   */
  public getHighScore(): number {
    return this.highScore;
  }
  
  /**
   * Obtiene el total de sesiones
   */
  public getTotalSessions(): number {
    return this.totalSessions;
  }
  
  /**
   * Obtiene el tiempo total en modo zen
   */
  public getTotalZenTime(): string {
    const minutes = Math.floor(this.totalZenTime / 60);
    const seconds = this.totalZenTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Actualiza la densidad de partículas
   */
  public updateParticleDensity(): void {
    console.log('Particle density updated:', this.particleDensity);
    // Aquí se implementaría la lógica para actualizar el sistema de partículas
  }
  
  /**
   * Actualiza el volumen del audio
   */
  public updateAudioVolume(): void {
    console.log('Audio volume updated:', this.audioVolume);
    // Aquí se implementaría la lógica para actualizar el audio
  }
  
  /**
   * Guarda la configuración
   */
  public saveSettings(): void {
    const settings = {
      particleDensity: this.particleDensity,
      showTrails: this.showTrails,
      enableGlow: this.enableGlow,
      audioVolume: this.audioVolume,
      enableSound: this.enableSound,
      gameDifficulty: this.gameDifficulty
    };
    
    localStorage.setItem('zenFlowSettings', JSON.stringify(settings));
    this.showSettings = false;
    console.log('Settings saved:', settings);
  }
  
  /**
   * Carga la configuración guardada
   */
  private loadSettings(): void {
    const saved = localStorage.getItem('zenFlowSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.particleDensity = settings.particleDensity || 0.6;
      this.showTrails = settings.showTrails !== false;
      this.enableGlow = settings.enableGlow !== false;
      this.audioVolume = settings.audioVolume || 0.7;
      this.enableSound = settings.enableSound !== false;
      this.gameDifficulty = settings.gameDifficulty || 'normal';
    }
  }
  
  /**
   * Carga las estadísticas guardadas
   */
  private loadStats(): void {
    const saved = localStorage.getItem('zenFlowStats');
    if (saved) {
      const stats = JSON.parse(saved);
      this.highScore = stats.highScore || 0;
      this.totalSessions = stats.totalSessions || 0;
      this.totalZenTime = stats.totalZenTime || 0;
    }
  }
  
  /**
   * Guarda las estadísticas
   */
  private saveStats(): void {
    const stats = {
      highScore: this.highScore,
      totalSessions: this.totalSessions,
      totalZenTime: this.totalZenTime
    };
    
    localStorage.setItem('zenFlowStats', JSON.stringify(stats));
  }
  
  /**
   * Configura controles touch/click para el juego
   */
  private setupInputControls(): void {
    // Escuchar eventos de teclado
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space' && this.gameEngine.isPlaying()) {
        this.gameEngine.handlePlayerInput();
      }
    }, { passive: true });
    
    // Escuchar eventos touch/click en el documento
    document.addEventListener('touchstart', (event) => {
      if (this.gameEngine.isPlaying()) {
        this.gameEngine.handlePlayerInput();
      }
    }, { passive: true });
    
    document.addEventListener('click', (event) => {
      if (this.gameEngine.isPlaying()) {
        this.gameEngine.handlePlayerInput();
      }
    }, { passive: true });
  }
  
  ngOnDestroy(): void {
    // El GameEngineService se limpia automáticamente
  }
  
  /**
   * Método para testing - inicia el juego en modo normal
   */
  public startNormalGame(): void {
    this.gameEngine.startGame({ mode: GameMode.NORMAL });
  }
  
  /**
   * Método para testing - inicia el juego en modo meditación
   */
  public startMeditationGame(): void {
    this.gameEngine.startGame({ mode: GameMode.MEDITATION });
  }
  
  /**
   * Método para testing - pausa/reanuda el juego
   */
  public togglePause(): void {
    if (this.gameEngine.isPlaying()) {
      this.gameEngine.pauseGame();
    } else if (this.gameEngine.isPaused()) {
      this.gameEngine.resumeGame();
    }
  }
  
  /**
   * Método para testing - maneja input del jugador
   */
  public handlePlayerInput(): void {
    this.gameEngine.handlePlayerInput();
  }
}
