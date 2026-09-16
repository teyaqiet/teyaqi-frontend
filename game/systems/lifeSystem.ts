/**
 * @teyaqi-feat: Teyaqi-Life-Engine
 * @teyaqi-info: Manages the logic for life depletion and time-based regeneration. 
 * This ensures the frontend accurately predicts the server's life-count state.
 * @teyaqi-fix: Uses the modulo operator (diffMs % msInPeriod) to calculate the 
 * exact millisecond offset for the next life. This prevents the "Timer Jump" 
 * bug where the countdown restarts prematurely on page refresh.
 * @teyaqi-dep: useLifeTimer, Dashboard
 */

export const MAX_LIVES = 5;
export const REGEN_TIME_MINS = 30;

/**
 * @teyaqi-feat: Optimistic-Regen-Calculator
 * @teyaqi-info: Takes the 'last_life_update' timestamp from the DB and 
 * calculates how many lives have been gained since the user was last online.
 */
export const calculateRegen = (dbLives: number, lastUpdate: string) => {
  const now = new Date().getTime();
  const last = new Date(lastUpdate).getTime();
  const diffMs = now - last;
  
  // Standardize time units
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const msInPeriod = REGEN_TIME_MINS * 60 * 1000;

  /**
   * @teyaqi-info: Gained lives logic. 
   * We floor the division to ensure a life is only "earned" once the 
   * full 30-minute window has closed.
   */
  const gained = Math.floor(diffMins / REGEN_TIME_MINS);
  const currentTotal = Math.min(MAX_LIVES, dbLives + gained);
  
  // Calculate milliseconds until the NEXT heart triggers
  // This value is passed directly into useLifeTimer.ts
  const nextHeartInMs = msInPeriod - (diffMs % msInPeriod);

  return {
    lives: currentTotal,
    nextHeartInMs: currentTotal >= MAX_LIVES ? 0 : nextHeartInMs,
    isFull: currentTotal >= MAX_LIVES
  };
};

/**
 * @teyaqi-feat: Life-Depletion-Logic
 * @teyaqi-info: Clamps the life count to 0. Used primarily by the game 
 * engine when a 'wrong' answer is submitted.
 */
export const updateLives = (currentLives: number, pointsLost: number = 1): number => {
  const remaining = currentLives - pointsLost;
  return remaining > 0 ? remaining : 0;
};