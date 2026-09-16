"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface LevelUpProps {
  isOpen: boolean;
  newLevel: number;
  newTitle: string;
  onClose: () => void;
}

export default function LevelUpModal({ isOpen, newLevel, newTitle, onClose }: LevelUpProps) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#fbbf24']
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-slate-900 border border-white/10 rounded-[3rem] p-8 w-full max-w-sm text-center shadow-[0_0_50px_rgba(59,130,246,0.3)]"
          >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-b from-yellow-400 to-orange-500 p-5 rounded-[2rem] shadow-xl">
                <Crown className="w-12 h-12 text-white fill-white" />
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-xs">New Rank Achieved</p>
              <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter">
                {newTitle}
              </h2>
              <p className="text-slate-400 font-medium">You've reached Level {newLevel}</p>
            </div>

            <div className="my-8 py-4 bg-slate-950/50 rounded-2xl border border-white/5 flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-500 w-5 h-5" />
              <span className="text-sm font-bold text-slate-300 italic uppercase">Power Up: +1 Daily Life Restored</span>
            </div>

            <button 
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(37,99,235,0.3)] uppercase italic"
            >
              Continue Journey
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}