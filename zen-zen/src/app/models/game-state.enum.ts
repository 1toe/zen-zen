/**
 * Estados del juego en Zen Flow
 * Controla el flujo principal de la aplicación
 */
export enum GameState {
  /** Pantalla de menú inicial */
  MENU = 'menu',
  
  /** Juego activo en curso */
  PLAYING = 'playing',
  
  /** Juego pausado temporalmente */
  PAUSED = 'paused',
  
  /** Fin del juego, mostrando estadísticas */
  GAME_OVER = 'gameOver',
  
  /** Estado de carga inicial */
  LOADING = 'loading',
  
  /** Estado de victoria/completado */
  VICTORY = 'victory'
}

/**
 * Modos de juego disponibles en Zen Flow
 */
export enum GameMode {
  /** Modo estándar con velocidad normal */
  NORMAL = 'normal',
  
  /** Modo relajante con velocidad reducida */
  MEDITATION = 'meditation'
}

/**
 * Niveles de dificultad
 */
export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  EXPERT = 'expert'
}

/**
 * Eventos del juego para comunicación entre componentes
 */
export enum GameEvent {
  PLAYER_COLLISION = 'playerCollision',
  POWERUP_COLLECTED = 'powerupCollected',
  LEVEL_UP = 'levelUp',
  GAME_STARTED = 'gameStarted',
  GAME_PAUSED = 'gamePaused',
  GAME_RESUMED = 'gameResumed',
  GAME_ENDED = 'gameEnded',
  ENERGY_DEPLETED = 'energyDepleted',
  ZEN_PROGRESS = 'zenProgress',
  ACHIEVEMENT_UNLOCKED = 'achievementUnlocked'
}
