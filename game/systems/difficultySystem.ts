/**
 * @teyaqi-feat: Teyaqi-Dynamic-Elo-System
 * @teyaqi-info: Calculates Skill Rating (SR) changes and UI difficulty labels.
 * This client-side logic is a 1:1 mirror of the Laravel backend to enable 
 * "Optimistic UI" updates—showing SR gains before the DB sync finishes.
 * @teyaqi-fix: The 'STRUGGLE_THRESHOLD' (8s) vs 'SLOW_THRESHOLD' (10s) 
 * distinction ensures that timeouts or near-timeouts are penalized more 
 * heavily (-5) than simple incorrect "rushed" guesses (-2).
 * @teyaqi-dep: GameState, gameReducer
 */

import { DifficultyLevel, GameState } from '../core/gameTypes';

const CONFIG = {
  MIN_SR: 0,
  MAX_SR: 100,
  FAST_THRESHOLD: 4000,   // < 4s: Speedy Mastery (+4)
  SLOW_THRESHOLD: 10000,  // > 10s: Hesitant Correct (+1)
  STRUGGLE_THRESHOLD: 8000, // > 8s: Significant struggle/Timeout (-5)
};

/**
 * @teyaqi-feat: SR-Calculation-Engine
 * @teyaqi-info: Determines the numerical shift in player rank based on 
 * the intersection of speed and accuracy.
 */
export const calculateNewSR = (currentSR: number, isCorrect: boolean, timeMs: number): number => {
  let change = 0;

  if (isCorrect) {
    if (timeMs < CONFIG.FAST_THRESHOLD) {
      change = 4; 
    } else if (timeMs > CONFIG.SLOW_THRESHOLD) {
      change = 1; 
    } else {
      change = 2; // Standard performance
    }
  } else {
    /**
     * @teyaqi-info: Penalty logic. 
     * High time + Wrong = Struggle (-5). 
     * Low time + Wrong = Rushing (-2).
     */
    change = timeMs > CONFIG.STRUGGLE_THRESHOLD ? -5 : -2;
  }

  const newSR = currentSR + change;
  return Math.min(CONFIG.MAX_SR, Math.max(CONFIG.MIN_SR, newSR));
};

/**
 * @teyaqi-feat: Visual-Difficulty-Manager
 * @teyaqi-info: Drives the "Difficulty" badge in the UI. While SR dictates the 
 * actual question pool, this function adds "flavor" (e.g., showing 'Easy' 
 * when on the last life to lower player anxiety).
 */
export const getAdjustedDifficulty = (state: GameState): DifficultyLevel => {
  // 1. Determine Base Rank from SR
  let base: DifficultyLevel = 'medium';
  if (state.sr < 40) base = 'easy';
  else if (state.sr > 70) base = 'hard';

  /**
   * @teyaqi-fix: Psychological UI adjustment. 
   * If the user is struggling (1 life left or 2+ wrong), we visually 
   * "downshift" the difficulty label to signal the engine is helping them.
   */
  if (state.lives === 1 || state.wrongStreak >= 2) return shift(base, -1);
  
  // High-performance "Up-shift"
  if (state.streak >= 3) return shift(base, 1);

  return base;
};

/**
 * @teyaqi-info: Pure helper to safely cycle through the DifficultyLevel union.
 */
const shift = (level: DifficultyLevel, delta: number): DifficultyLevel => {
  const levels: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  const idx = levels.indexOf(level);
  const newIdx = Math.min(levels.length - 1, Math.max(0, idx + delta));
  return levels[newIdx] as DifficultyLevel;
};