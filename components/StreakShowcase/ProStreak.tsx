"use client";

import { motion } from "framer-motion";
import { Flame, Zap, TrendingUp } from "lucide-react";

interface StreakProps {
  days: number;
  onContinue: () => void;
}

export default function ProStreak({ days, onContinue }: StreakProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden font-sans">
      
      {/* Intense Orange Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,transparent_70%)]" />

      {/* Animated Flame Container */}
      <motion.div
        initial={{ scale: 0.5, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="relative mb-12"
      >
        {/* Main Flame Icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            filter: ["blur(0px)", "blur(1px)", "blur(0px)"]
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Flame className="w-40 h-40 text-orange-500 fill-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]" />
        </motion.div>

        {/* Floating Zap Badge */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute -right-4 top-4 bg-yellow-400 p-3 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.4)] rotate-12"
        >
          <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
        </motion.div>
        
        {/* Particle Embers */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -120, opacity: [0, 1, 0], x: (i - 2) * 25 }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full blur-[1px]"
          />
        ))}
      </motion.div>

      {/* Stats and Typography */}
      <div className="relative z-10 space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-[10px] font-black uppercase tracking-widest italic"
        >
          <TrendingUp className="w-3 h-3" />
          Consistency Master
        </motion.div>

        <div className="space-y-0">
          <motion.h2 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-orange-500 leading-none tracking-tighter"
          >
            {days}
          </motion.h2>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-widest">
            Day Streak
          </h3>
        </div>

        <p className="text-slate-400 text-sm max-w-[260px] mx-auto leading-relaxed">
          You're gaining serious momentum! Don't let the fire go out now.
        </p>
      </div>

      {/* High-Impact Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.96 }}
        onClick={onContinue}
        className="mt-14 z-[101] w-full max-w-xs py-5 bg-gradient-to-r from-orange-600 to-orange-500 rounded-[2rem] font-black text-white shadow-[0_20px_40px_-15px_rgba(234,88,12,0.4)] uppercase italic tracking-widest text-sm"
      >
        Protect the Flame
      </motion.button>
    </div>
  );
}