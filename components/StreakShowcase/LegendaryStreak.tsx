"use client";

import { motion } from "framer-motion";
import { Crown, Sparkles, ShieldCheck, Zap } from "lucide-react";

interface StreakProps {
  days: number;
  onContinue: () => void;
}

export default function LegendaryStreak({ days, onContinue }: StreakProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden font-sans">
      
      {/* Cyan Supernova Pulsing Glow */}
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.1, 1]
        }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2)_0%,transparent_70%)]" 
      />

      {/* Hero Icon Section */}
      <motion.div
        initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative mb-14"
      >
        <div className="relative">
          <Crown className="w-44 h-44 text-cyan-400 drop-shadow-[0_0_50px_rgba(34,211,238,0.8)]" />
          
          {/* Animated Orbiting Sparkles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ repeat: Infinity, duration: 5, delay: i * 1.5, ease: "linear" }}
              className="absolute inset-0"
            >
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-4 left-1/2" />
            </motion.div>
          ))}
        </div>

        {/* Level Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,211,238,0.5)]"
        >
          Godlike
        </motion.div>
      </motion.div>

      {/* Text & Stats */}
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col items-center">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[11rem] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500 leading-[0.8] tracking-tighter"
          >
            {days}
          </motion.h2>
          <h3 className="text-3xl font-black text-white uppercase italic tracking-[0.2em] mt-4">
            Day Streak
          </h3>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-cyan-400/80 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                Elite Tier
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <div className="flex items-center gap-2 text-cyan-400/80 text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-4 h-4 fill-cyan-400" />
                Top 1%
            </div>
        </div>

        <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed font-medium">
          You've surpassed the mortals. Your discipline is legendary. Keep the streak alive at all costs.
        </p>
      </div>

      {/* Legendary Action Button */}
      <motion.button
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="mt-16 relative group"
      >
        <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative px-12 py-6 bg-white rounded-[2.5rem] font-black text-slate-950 uppercase italic tracking-[0.25em] text-sm flex items-center gap-4">
          Maintain the Throne
        </div>
      </motion.button>
    </div>
  );
}