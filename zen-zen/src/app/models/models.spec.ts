import { createPlayer, Player } from './player.model';
import { createObstacle, Obstacle } from './obstacle.model';
import { createPowerUp, PowerUp } from './powerup.model';
import { GameState, GameMode, Difficulty } from './game-state.enum';
import { createDefaultGameConfig, createMeditationConfig } from './game-config.model';

describe('Models', () => {
  
  describe('Player Model', () => {
    it('should create player with default values', () => {
      const player = createPlayer();
      
      expect(player.id).toBeDefined();
      expect(player.energy).toBe(100);
      expect(player.maxEnergy).toBe(100);
      expect(player.isAlive).toBe(true);
      expect(player.score).toBe(0);
      expect(player.level).toBe(1);
      expect(player.zenProgress).toBe(0);
      expect(player.radius).toBe(15);
    });

    it('should create player with custom values', () => {
      const customPlayer = createPlayer({
        energy: 50,
        score: 100,
        level: 2
      });
      
      expect(customPlayer.energy).toBe(50);
      expect(customPlayer.score).toBe(100);
      expect(customPlayer.level).toBe(2);
      expect(customPlayer.maxEnergy).toBe(100); // Valor por defecto
    });

    it('should have valid position and velocity', () => {
      const player = createPlayer();
      
      expect(player.position.x).toBe(50);
      expect(player.position.y).toBe(250);
      expect(player.velocity.x).toBe(0);
      expect(player.velocity.y).toBe(0);
    });
  });

  describe('Obstacle Model', () => {
    it('should create obstacle with default values', () => {
      const obstacle = createObstacle();
      
      expect(obstacle.id).toBeDefined();
      expect(obstacle.type).toBe('static');
      expect(obstacle.shape).toBe('rectangle');
      expect(obstacle.damage).toBe(10);
      expect(obstacle.isActive).toBe(true);
      expect(obstacle.color).toBe('#ff6b6b');
      expect(obstacle.opacity).toBe(0.8);
    });

    it('should create obstacle with custom values', () => {
      const customObstacle = createObstacle({
        type: 'moving',
        shape: 'circle',
        damage: 20,
        radius: 25
      });
      
      expect(customObstacle.type).toBe('moving');
      expect(customObstacle.shape).toBe('circle');
      expect(customObstacle.damage).toBe(20);
      expect(customObstacle.radius).toBe(25);
    });
  });

  describe('PowerUp Model', () => {
    it('should create energy power-up correctly', () => {
      const powerUp = createPowerUp('energy', { x: 100, y: 200 });
      
      expect(powerUp.type).toBe('energy');
      expect(powerUp.position.x).toBe(100);
      expect(powerUp.position.y).toBe(200);
      expect(powerUp.value).toBe(20);
      expect(powerUp.color).toBe('#4ecdc4');
      expect(powerUp.isActive).toBe(true);
    });

    it('should create score power-up correctly', () => {
      const powerUp = createPowerUp('score', { x: 50, y: 50 });
      
      expect(powerUp.type).toBe('score');
      expect(powerUp.value).toBe(50);
      expect(powerUp.color).toBe('#ffd93d');
      expect(powerUp.effect).toBe('sparkle');
    });

    it('should create shield power-up with duration', () => {
      const powerUp = createPowerUp('shield', { x: 0, y: 0 });
      
      expect(powerUp.type).toBe('shield');
      expect(powerUp.duration).toBe(5000);
      expect(powerUp.color).toBe('#6c5ce7');
    });

    it('should respect custom overrides', () => {
      const powerUp = createPowerUp('zen', { x: 0, y: 0 }, {
        value: 0.2,
        color: '#custom'
      });
      
      expect(powerUp.value).toBe(0.2);
      expect(powerUp.color).toBe('#custom');
      expect(powerUp.type).toBe('zen'); // No debe sobrescribirse
    });
  });

  describe('Game State Enums', () => {
    it('should have correct game states', () => {
      expect(GameState.MENU).toBe('menu');
      expect(GameState.PLAYING).toBe('playing');
      expect(GameState.PAUSED).toBe('paused');
      expect(GameState.GAME_OVER).toBe('gameOver');
      expect(GameState.LOADING).toBe('loading');
      expect(GameState.VICTORY).toBe('victory');
    });

    it('should have correct game modes', () => {
      expect(GameMode.NORMAL).toBe('normal');
      expect(GameMode.MEDITATION).toBe('meditation');
    });

    it('should have correct difficulty levels', () => {
      expect(Difficulty.EASY).toBe('easy');
      expect(Difficulty.NORMAL).toBe('normal');
      expect(Difficulty.HARD).toBe('hard');
      expect(Difficulty.EXPERT).toBe('expert');
    });
  });

  describe('Game Config', () => {
    it('should create default config correctly', () => {
      const config = createDefaultGameConfig();
      
      expect(config.difficulty).toBe(Difficulty.NORMAL);
      expect(config.mode).toBe(GameMode.NORMAL);
      expect(config.render.targetFPS).toBe(60);
      expect(config.physics.gravity).toBe(0.5);
      expect(config.spawning.obstacleRate).toBe(0.8);
      expect(config.audio.enabled).toBe(true);
    });

    it('should create meditation config with correct adjustments', () => {
      const config = createMeditationConfig();
      
      expect(config.mode).toBe(GameMode.MEDITATION);
      expect(config.physics.gravity).toBeLessThan(0.5);
      expect(config.spawning.obstacleRate).toBeLessThan(0.8);
      expect(config.meditation.visualCalmness).toBe(0.9);
      expect(config.meditation.gentleColors).toBe(true);
    });

    it('should have valid render configuration', () => {
      const config = createDefaultGameConfig();
      
      expect(config.render.canvasSize.width).toBe(800);
      expect(config.render.canvasSize.height).toBe(600);
      expect(config.render.backgroundColor).toBeDefined();
      expect(config.render.particles.enabled).toBe(true);
    });

    it('should have valid physics configuration', () => {
      const config = createDefaultGameConfig();
      
      expect(config.physics.maxSpeed).toBeGreaterThan(0);
      expect(config.physics.friction).toBeLessThan(1);
      expect(config.physics.friction).toBeGreaterThan(0);
      expect(config.physics.impulseForce).toBeGreaterThan(0);
    });
  });
});
