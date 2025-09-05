import { TestBed } from '@angular/core/testing';
import { GameEngineService } from './game-engine.service';
import { GameState, GameMode, GameEvent } from '../models';

describe('GameEngineService', () => {
  let service: GameEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with correct default state', () => {
    expect(service.getGameState()).toBe(GameState.MENU);
    expect(service.getPlayer().isAlive).toBe(true);
    expect(service.getPlayer().energy).toBe(100);
    expect(service.getPlayer().score).toBe(0);
    expect(service.getPlayer().level).toBe(1);
  });

  it('should start game and change state to PLAYING', () => {
    service.startGame();
    expect(service.getGameState()).toBe(GameState.PLAYING);
    expect(service.isPlaying()).toBe(true);
  });

  it('should pause and resume game correctly', () => {
    service.startGame();
    service.pauseGame();
    expect(service.getGameState()).toBe(GameState.PAUSED);
    expect(service.isPaused()).toBe(true);
    
    service.resumeGame();
    expect(service.getGameState()).toBe(GameState.PLAYING);
    expect(service.isPlaying()).toBe(true);
  });

  it('should reset game to initial state', () => {
    service.startGame();
    service.resetGame();
    expect(service.getGameState()).toBe(GameState.MENU);
    expect(service.getPlayer().score).toBe(0);
  });

  it('should emit game events', (done) => {
    service.gameEvents$.subscribe(event => {
      expect(event.type).toBe(GameEvent.GAME_STARTED);
      expect(event.timestamp).toBeDefined();
      done();
    });
    
    service.startGame();
  });

  it('should handle player input correctly', () => {
    service.startGame();
    const initialVelocityY = service.getPlayer().velocity.y;
    
    service.handlePlayerInput();
    
    expect(service.getPlayer().velocity.y).toBeLessThan(initialVelocityY);
  });

  it('should apply meditation mode configuration', () => {
    service.startGame({ mode: GameMode.MEDITATION });
    
    const config = service.getConfig();
    expect(config.mode).toBe(GameMode.MEDITATION);
    expect(config.physics.gravity).toBeLessThan(0.5); // Gravity reducida en meditación
  });

  it('should update zen progress based on position', () => {
    service.startGame();
    
    // Simular actualización del estado
    service.updateState(0.016); // ~60 FPS
    
    const player = service.getPlayer();
    expect(player.zenProgress).toBeGreaterThanOrEqual(0);
    expect(player.zenProgress).toBeLessThanOrEqual(1);
  });

  it('should end game when energy is depleted', () => {
    service.startGame();
    
    // Simular pérdida de energía
    const player = service.getPlayer();
    (service as any)._player.set({ ...player, energy: 0 });
    
    service.updateState(0.016);
    
    expect(service.getGameState()).toBe(GameState.GAME_OVER);
  });

  it('should compute signals correctly', () => {
    expect(service.isPlaying()).toBe(false);
    expect(service.isPaused()).toBe(false);
    expect(service.isGameOver()).toBe(false);
    expect(service.totalObjects()).toBe(0);
    
    service.startGame();
    expect(service.isPlaying()).toBe(true);
  });
});
