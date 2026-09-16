/**
 * @teyaqi-feat: Streak-Logic-Utility
 * @teyaqi-info: Pure functions for determining streak visual states.
 */

import { StreakStatus } from "../types/gameTypes";

export const streakSystem = {
  /**
   * Validates the status based on the streak count and backend feedback.
   */
  getValidatedStreak: (streak: number, lastPlayed: string | null): { status: StreakStatus } => {
    if (streak === 0) return { status: 'dead' };
    
    // Logic: If the server says we have a streak but didn't 'increment' it 
    // (e.g., today is already recorded or a freeze was used), we can adjust status.
    // For now, let's assume 'active' for any positive streak.
    return { status: 'active' };
  },

  /**
   * Determines if the UI should pop the Celebration Modal.
   */
  shouldCelebrate: (streak: number, status: StreakStatus): boolean => {
    // We celebrate if the streak is active and positive.
    // You can add logic here: (streak % 7 === 0) to only celebrate milestones.
    return streak > 0 && status !== 'dead';
  }
};