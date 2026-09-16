/**
 * @teyaqi-feat: Dynamic-Challenge-XP-Reward-System
 * @teyaqi-info: Calculates the immediate XP gain for a correct answer. 
 * Combines a dynamic challenge base rate, a speed bonus, and a tiered streak multiplier.
 */

interface ScoreParameters {
  baseXp: number;     // Configured from the challenge creator form (reward_xp)
  timeLeft: number;   // Remaining seconds on the clock when answered
  timeLimit: number;  // The maximum time configured for the question (e.g., 5, 15)
  streak: number;     // The current consecutive correct answer count (including this answer)
}

export const calculateScore = ({ baseXp, timeLeft, timeLimit, streak }: ScoreParameters): number => {
  // 1. Dynamic Base XP from Challenge Configuration Form
  const base = baseXp > 0 ? baseXp : 10; // Fallback to 10 if not set

  // 2. Speed Bonus (The 3-Second Rule)
  // Calculate exactly how long the player took to tap an answer
  const timeSpent = timeLimit - timeLeft;
  const speedBonus = timeSpent <= 3 ? 5 : 0;
  
  // 3. Tiered Streak Milestone Bonus
  let streakBonus = 0;
  if (streak === 3) {
    streakBonus = 30; // Instant +30 milestone boost on the 3rd correct answer
  } else if (streak > 3) {
    streakBonus = 30 + (streak - 3) * 10; // +30 baseline plus an extra +10 for every chain link past 3
  }

  // Total calculated reward return value
  return base + speedBonus + streakBonus;
};