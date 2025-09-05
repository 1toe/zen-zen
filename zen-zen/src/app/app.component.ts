import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameEngineService } from './services';
import { GameState, GameMode } from './models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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
  
  ngOnInit(): void {
    // Suscribirse a eventos del juego para logging
    this.gameEngine.gameEvents$.subscribe(event => {
      console.log('Game Event:', event.type, event.data);
    });
    
    // Inicializar con configuración por defecto
    console.log('Zen Flow initialized');
    console.log('Current game state:', this.gameState());
    console.log('Player initial state:', this.player());
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
