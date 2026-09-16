export type GameStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'gameover';

export interface GameState {
  status: GameStatus;
  questions: any[];
  currentQuestionIndex: number;
  lives: number;
  score: number;
  streak: number;
  isCorrect: boolean | null;
}

export type GameAction =
  | { type: 'START_GAME'; payload: { questions: any[]; lives: number } }
  | { type: 'SUBMIT_ANSWER'; payload: { isCorrect: boolean } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET_GAME' };