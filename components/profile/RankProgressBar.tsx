"use client";

import { motion } from "framer-motion";

interface RankProgressBarProps {
  title: string;
  totalXp: number;
  currentXp: number;
  nextLevelXp: number;
}

export function RankProgressBar({ title, totalXp, currentXp, nextLevelXp }: RankProgressBarProps) {
  // Prevent division by zero and handle layout limits safely
  const safeNextXp = nextLevelXp || 1000;
  const progressPercent = Math.min(100, Math.max(0, (currentXp / safeNextXp) * 100));
  const xpNeeded = Math.max(0, safeNextXp - currentXp);

  return (
    <div className="w-full bg-[#0d1630] rounded-[2rem] p-6 shadow-md text-white">
      <div className="flex justify-between items-end mb-3">
        <div>
          <p className="text-xs text-slate-400 font-semibold tracking-wide mb-0.5">Current Rank</p>
          <h3 className="text-3xl font-extrabold tracking-tight capitalize">{title}</h3>
        </div>
        <div className="text-right">
          <h4 className="text-2xl font-extrabold tracking-tight">{totalXp.toLocaleString()}</h4>
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total XP</p>
        </div>
      </div>

      {/* Progress Track Bar Container */}
      <div className="h-5 w-full bg-white rounded-full overflow-hidden p-0.5 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-[#3cd093] rounded-full"
        />
      </div>

      <p className="text-[10px] text-center mt-3 font-bold uppercase tracking-widest text-white/90">
        {xpNeeded.toLocaleString()} XP TO NEXT RANK
      </p>
    </div>
  );
}