"use client";

import { motion } from "framer-motion";
import { Sparkles, Skull, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface GameOverProps {
  score: number;
  onComplete: () => void;
}

export default function GameOver({ score, onComplete }: GameOverProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    // Timer to start the exit animation after the progress bar is full
    // 5000ms for the bar + 300ms for "breathing room"
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 5300);

    // Final cleanup: give the exit animation 500ms to finish
    const finalTimer = setTimeout(() => {
      onComplete();
    }, 5800);

    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(exitTimer);
      clearTimeout(finalTimer);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={isExiting ? { opacity: 0, scale: 0.9, filter: "blur(20px)" } : { opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 text-center touch-none select-none overflow-hidden"
    >
      {/* 1. Pulse Background Glow */}
      <motion.div 
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none"
      />

      {/* 2. Visual Centerpiece */}
      <div className="relative mb-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="bg-slate-900/50 p-10 rounded-[40px] border border-white/5 relative z-10 backdrop-blur-sm"
        >
          <Skull className="w-24 h-24 text-slate-500 stroke-[1.5px]" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-6 bg-red-500/10 blur-3xl rounded-full"
        />
      </div>

      {/* 3. Text Content */}
      <div className="relative z-10 max-w-xs">
        <h2 className="text-5xl font-black text-white mb-2 tracking-tighter italic uppercase">
          GAME OVER
        </h2>
        <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase mb-8 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          Anbesa is recharging...
        </p>
        
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Session Earnings</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-6xl font-black text-white tabular-nums tracking-tighter">{score}</p>
            <div className="flex flex-col items-start leading-none">
              <span className="text-blue-500 font-black italic text-xl">XP</span>
              <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Progress Bar */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]"
        />
      </div>

      {/* 5. Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] z-[60] bg-[length:100%_4px]" />
    </motion.div>
  );
}