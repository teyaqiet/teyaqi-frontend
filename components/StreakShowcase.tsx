"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield } from 'lucide-react';

interface StreakModalProps {
  days: number;                                      // 🔄 Synced parameter
  status: 'incremented' | 'frozen' | 'maintained' | 'reset';
  rewardedFreeze?: boolean;                          // Made optional to safely fallback
  onContinue: () => void;                            // 🔄 Synced parameter
}

export const StreakModal = ({ 
  days, 
  status, 
  rewardedFreeze = false, 
  onContinue 
}: StreakModalProps) => {
  
  const isFrozen = status === 'frozen';

  return (
    <div className="relative w-full max-w-sm p-8 mx-4 text-center bg-gray-900 border border-orange-500/30 rounded-3xl shadow-2xl">
      {/* The Animated Flame */}
      <motion.div
        animate={{ 
          scale: isFrozen ? [1, 1.05, 1] : [1, 1.1, 1],
          filter: isFrozen
            ? ["drop-shadow(0 0 10px #22d3ee)", "drop-shadow(0 0 25px #06b6d4)", "drop-shadow(0 0 10px #22d3ee)"]
            : ["drop-shadow(0 0 10px #f97316)", "drop-shadow(0 0 25px #ea580c)", "drop-shadow(0 0 10px #f97316)"]
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex justify-center mb-4"
      >
        <Flame 
          size={80} 
          className={isFrozen ? "text-cyan-400 fill-cyan-400" : "text-orange-500 fill-orange-500"} 
        />
      </motion.div>

      <h2 className="mb-2 text-3xl font-bold text-white">
        {isFrozen ? 'Saved!' : `${days} Day Streak!`}
      </h2>
      
      <p className="mb-6 text-gray-400 text-sm leading-relaxed">
        {isFrozen 
          ? "Your shield protected your streak today!" 
          : "You're on fire! Keep it up to earn more rewards."}
      </p>

      {/* Shield Reward Alert */}
      {rewardedFreeze && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 p-3 mb-6 border bg-blue-500/10 border-blue-500/40 rounded-xl text-left"
        >
          <Shield className="text-blue-400 shrink-0" />
          <span className="text-sm font-semibold text-blue-300">+1 Streak Freeze Earned!</span>
        </motion.div>
      )}

      <button
        onClick={onContinue}
        className={`w-full py-4 font-bold text-white transition-all rounded-xl active:scale-95 shadow-lg ${
          isFrozen 
            ? "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20" 
            : "bg-orange-600 hover:bg-orange-500 shadow-orange-500/20"
        }`}
      >
        Continue
      </button>
    </div>
  );
};