/**
 * @teyaqi-feat: Teyaqi-Ranking-System
 * @teyaqi-info: Defines the visual tiers for players based on their Skill Rating (SR). 
 * These ranks drive the profile badges and leaderboard styling.
 * @teyaqi-fix: The 'Anbesa' rank is capped at 100 SR to match the CONFIG.MAX_SR 
 * in gameUtils.ts, ensuring the highest tier is attainable but exclusive.
 * @teyaqi-dep: ProfileCard, LeaderboardItem
 */

export const RANKS = [
  { min: 0,  max: 20,  label: "Novice",  color: "text-slate-400",  bg: "bg-slate-500/10" },
  { min: 21, max: 50,  label: "Scholar", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { min: 51, max: 80,  label: "Expert",  color: "text-blue-400",    bg: "bg-blue-500/10" },
  { min: 81, max: 95,  label: "Elite",   color: "text-purple-400",  bg: "bg-purple-500/10" },
  
  /**
   * @teyaqi-feat: The-Anbesa-Tier
   * @teyaqi-info: The pinnacle of Teyaqi performance. Includes the Lion emoji 
   * to resonate with Ethiopian cultural symbols of strength and leadership.
   */
  { min: 96, max: 100, label: "Anbesa 🦁", color: "text-amber-400",   bg: "bg-amber-500/10" },
];

/**
 * @teyaqi-feat: Rank-Resolver
 * @teyaqi-info: Maps a numerical SR to its corresponding Rank object.
 * @teyaqi-fix: Added a fallback to RANKS[0] to ensure the UI never 
 * crashes if an invalid or null SR is passed during the initial load.
 */
export const getRank = (sr: number) => {
  return RANKS.find(r => sr >= r.min && sr <= r.max) || RANKS[0];
};