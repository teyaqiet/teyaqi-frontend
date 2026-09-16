/**
 * @teyaqi-feat: Teyaqi-Progression-Formatter
 * @teyaqi-info: Translates raw XP and Level data from the User API into 
 * UI-ready values. Designed to support Amharic titles natively.
 * @teyaqi-fix: Uses a simple (Current / Next) ratio. Since Laravel calculates 
 * the 'nextLevelXp' threshold dynamically based on the user's current rank, 
 * the frontend doesn't need to know the complex leveling formulas.
 * @teyaqi-dep: ProfileHeader, LevelUpModal
 */

export const levelSystem = {
  /**
   * @teyaqi-feat: XP-Progress-Bar
   * @teyaqi-info: Calculates the percentage of completion for the current level.
   * Driven by the 'xp' and 'next_level_xp' fields from the User object.
   */
  calculateProgress: (currentXp: number, nextLevelXp: number): number => {
    if (!nextLevelXp || nextLevelXp === 0) return 100;
    
    // Progress is (Total XP / Goal XP) * 100
    const progress = (currentXp / nextLevelXp) * 100;
    return Math.min(Math.max(progress, 0), 100);
  },

  /**
   * @teyaqi-feat: Localized-Rank-Titles
   * @teyaqi-info: Handles the display of titles (e.g., 'ጀማሪ', 'ሊቅ').
   * @teyaqi-fix: Provides "Novice" as a fallback to prevent empty UI 
   * badges if the API response is delayed or null.
   */
  formatTitle: (title: string): string => {
    return title || "Novice";
  },

  /**
   * @teyaqi-feat: Level-Up-Trigger
   * @teyaqi-info: Used inside a useEffect or useGameSync to determine 
   * if we should fire off the confetti and 'victory' sound.
   */
  checkLevelUp: (oldLevel: number, newLevel: number): boolean => {
    return newLevel > oldLevel;
  }
};