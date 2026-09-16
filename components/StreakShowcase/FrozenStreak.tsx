"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, Flame, Loader2 } from 'lucide-react'; 
import { cn } from "@/lib/utils";
import { useStreakManager } from "@/game/hooks/useStreakManager"; 
import { useGame } from "@/game/hooks/useGame"; 
// ✅ FIXED: Imported the named 'StreakModal' export and aliased it as 'StreakShowcase'
import { StreakModal as StreakShowcase } from "../StreakShowcase"; 

interface FrozenStreakProps {
  count: number;
  status: 'active' | 'frozen' | 'dead';
  className?: string;
}

export const FrozenStreak: React.FC<FrozenStreakProps> = ({ count, status, className }) => {
  const game = useGame();
  
  const { 
    isFreezeModalOpen, 
    setIsFreezeModalOpen, 
    activateFreezeShield, 
    isLoading 
  } = useStreakManager(game?.dispatch || (() => {}));

  if (status === 'dead') return null;
  const isFrozen = status === 'frozen';

  return (
    <>
      <motion.div
        layout
        className={cn(
          "relative flex items-center gap-4 px-4 py-2 min-w-[180px] rounded-2xl border-2 transition-all duration-500 bg-slate-900/90",
          isFrozen 
            ? "border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
            : "border-orange-400/50 shadow-[0_0_15px_rgba(251,146,60,0.2)]",
          className
        )}
      >
        {/* Streak Info */}
        <div className="flex items-center gap-2">
          {isFrozen ? (
            <Snowflake className="w-6 h-6 text-cyan-400 animate-pulse" />
          ) : (
            <Flame className="w-6 h-6 text-orange-500" />
          )}
          <div className="flex flex-col leading-none">
            <span className={cn("text-2xl font-black italic", isFrozen ? "text-cyan-300" : "text-orange-400")}>
              {count}
            </span>
            <span className="text-[8px] font-bold uppercase text-white/50 tracking-tighter">Day Streak</span>
          </div>
        </div>

        {/* The Action Button */}
        {isFrozen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            onClick={async () => {
              await activateFreezeShield();
            }}
            className="ml-auto bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 shadow-lg shadow-cyan-500/20 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Snowflake className="w-3 h-3 fill-current" />
            )}
            Unfreeze
          </motion.button>
        )}
      </motion.div>

      {/* The Celebration Modal Controller */}
      <AnimatePresence>
        {isFreezeModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex items-center justify-center p-4">
            <StreakShowcase 
              days={count} 
              status="frozen" 
              onContinue={() => setIsFreezeModalOpen(false)} 
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};