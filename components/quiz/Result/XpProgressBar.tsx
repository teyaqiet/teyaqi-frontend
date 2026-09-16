"use client";

import { useEffect, useState, useMemo } from "react";

interface LevelTier {
  id: number;
  level_number: number;
  title: string;
  min_xp: number;
  hex_color: string;
}

interface XpProgressBarProps {
  score: number;
  userTotalXp: number;
  levels: LevelTier[];
  startXpAnimation: boolean;
}

export function XpProgressBar({
  score = 0,
  userTotalXp = 0,
  levels = [],
  startXpAnimation,
}: XpProgressBarProps) {
  
  // 1. Calculate the starting point before this session's score was added
  const previousXp = Math.max(0, userTotalXp - score);

  // 2. Local state holding the ticking animation points
  const [animatedXp, setAnimatedXp] = useState(previousXp);

  // Reset state to baseline if animation flag resets
  useEffect(() => {
    if (!startXpAnimation) {
      setAnimatedXp(previousXp);
    }
  }, [previousXp, startXpAnimation]);

  // 3. Smooth cubic-ease-out animation driver framework
  useEffect(() => {
    if (!startXpAnimation) return;

    if (score <= 0) {
      setAnimatedXp(userTotalXp);
      return;
    }

    const duration = 2200; // Giving it a smooth window to slide
    const startTime = performance.now();

    const animateFrame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Decelerating calculation progress check
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(previousXp + (userTotalXp - previousXp) * eased);

      setAnimatedXp(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      }
    };

    requestAnimationFrame(animateFrame);
  }, [startXpAnimation, previousXp, userTotalXp, score]);

  // 4. DYNAMIC LEVEL LOOKUP: Get correct floor/ceiling meta arrays for the animated value
  const levelMeta = useMemo(() => {
    // Robust local fallback array scaled appropriately if levels prop array arrives empty
    const activeLevels = levels && levels.length > 0 ? levels : [
      { id: 1, level_number: 1, title: "Novice", min_xp: 0, hex_color: "#1cd05d" },
      { id: 2, level_number: 2, title: "Explorer", min_xp: 1000, hex_color: "#1cd05d" },
      { id: 3, level_number: 3, title: "Scholar", min_xp: 5000, hex_color: "#1cd05d" },
      { id: 4, level_number: 4, title: "Expert", min_xp: 15000, hex_color: "#1cd05d" },
      { id: 5, level_number: 5, title: "Master", min_xp: 30000, hex_color: "#1cd05d" },
    ];

    // Sort levels securely by ascending minimum requirements
    const sorted = [...activeLevels].sort((a, b) => a.min_xp - b.min_xp);
    
    let currentTier = sorted[0];
    let nextTier = sorted[1];

    // Evaluate step thresholds matching the current ticking animated XP
    for (let i = 0; i < sorted.length; i++) {
      if (animatedXp >= sorted[i].min_xp) {
        currentTier = sorted[i];
        // If there's an upper tier, use its milestone. Otherwise calculate a dynamic ceiling.
        nextTier = sorted[i + 1] || { 
          ...sorted[i], 
          level_number: sorted[i].level_number + 1,
          title: sorted[i].title,
          min_xp: sorted[i].min_xp * 1.5 
        };
      }
    }

    return {
      levelTitle: currentTier.title || `Level ${currentTier.level_number}`,
      currentFloor: currentTier.min_xp,
      nextCeiling: nextTier.min_xp
    };
  }, [levels, animatedXp]);

  // 5. PROGRESS BAR PERCENTAGE: Normalizing values relative to current tier floor
  const progressPct = useMemo(() => {
    const totalTierRange = levelMeta.nextCeiling - levelMeta.currentFloor;
    if (totalTierRange <= 0) return 100;

    const relativeXpEarned = animatedXp - levelMeta.currentFloor;
    const computedPercentage = (relativeXpEarned / totalTierRange) * 100;

    // Safety clamps between empty and filled completely
    return Math.min(Math.max(computedPercentage, 0), 100);
  }, [animatedXp, levelMeta]);

  return (
    <div className="w-full mt-1 space-y-2">
      {/* Level Title and Earned Score Inline Status Row */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-black uppercase text-white tracking-wide">
          {levelMeta.levelTitle}
        </span>
        <span className="text-sm font-black text-[#1cd05d]">
          +{score} XP
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-6 w-full overflow-hidden rounded-full border border-white/5 bg-[#1e293b]/60 shadow-inner">
        {/* Animated Green Filling Layer */}
        <div
          className="h-full bg-[#1cd05d] rounded-full transition-all duration-[16ms] ease-linear"
          style={{ width: `${progressPct}%` }}
        />

        {/* Text Overlay Indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] tracking-wide">
            {animatedXp.toLocaleString()} / {levelMeta.nextCeiling.toLocaleString()} XP
          </span>
        </div>
      </div>
    </div>
  );
}