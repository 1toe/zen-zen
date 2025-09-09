/**
 * Estados del juego en Zen Harmonics
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
  VICTORY = 'victory',
  
  /** Estado de tutorial */
  TUTORIAL = 'tutorial'
}

/**
 * Modos de juego disponibles en Zen Harmonics
 */
export enum GameMode {
  /** Modo libre para crear patrones armónicos sin presión */
  HARMONY = 'harmony',
  
  /** Modo con objetivos específicos de patrones a completar */
  RESONANCE = 'resonance',
  
  /** Modo de equilibrio entre diferentes tipos de energía */
  BALANCE = 'balance',
  
  /** Modo normal (para compatibilidad) */
  NORMAL = 'normal',
  
  /** Modo meditación (para compatibilidad) */
  MEDITATION = 'meditation'
}

/**
 * Niveles de dificultad
 */
export enum Difficulty {
  BEGINNER = 'beginner',
  ADEPT = 'adept',
  MASTER = 'master',
  ENLIGHTENED = 'enlightened',
  
  /** Dificultad fácil (para compatibilidad) */
  EASY = 'easy',
  
  /** Dificultad media (para compatibilidad) */
  MEDIUM = 'medium',
  
  /** Dificultad difícil (para compatibilidad) */
  HARD = 'hard'
}

/**
 * Tipos de energía en el juego
 */
export enum EnergyType {
  CALM = 'calm',    // Energía tranquila (azul)
  VIBRANT = 'vibrant', // Energía vibrante (verde)
  INTENSE = 'intense',  // Energía intensa (rojo)
  HARMONIC = 'harmonic' // Energía armónica (púrpura, combinación perfecta)
}

/**
 * Eventos del juego para comunicación entre componentes
 */
export enum GameEvent {
  CORE_COLLISION = 'coreCollision',
  RESONATOR_ACTIVATED = 'resonatorActivated',
  RESONATOR_CONNECTED = 'resonatorConnected',
  PATTERN_COMPLETED = 'patternCompleted',
  HARMONY_INCREASED = 'harmonyIncreased',
  DISSONANCE_DETECTED = 'dissonanceDetected',
  POWERUP_COLLECTED = 'powerupCollected',
  GAME_STARTED = 'gameStarted',
  GAME_PAUSED = 'gamePaused',
  GAME_RESUMED = 'gameResumed',
  GAME_ENDED = 'gameEnded',
  ENERGY_BALANCED = 'energyBalanced',
  ENERGY_DEPLETED = 'energyDepleted',
  ACHIEVEMENT_UNLOCKED = 'achievementUnlocked'
}
