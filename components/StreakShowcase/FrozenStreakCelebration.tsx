"use client";
import { motion } from "framer-motion";
import { Snowflake, Zap } from "lucide-react";

export function FrozenStreakCelebration({ days, onContinue }: { days: number, onContinue: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="flex flex-col items-center text-center w-full max-w-[350px] bg-slate-900 border-2 border-cyan-400/30 p-10 rounded-[2.5rem] shadow-[0_0_40px_rgba(34,211,238,0.2)]"
    >
      <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400 mb-6">
        <Snowflake className="w-10 h-10 text-cyan-400" />
      </div>

      <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 leading-none">
        STREAK <br/> <span className="text-cyan-400 underline decoration-cyan-400/20">DEFROSTED</span>
      </h2>
      
      <p className="text-slate-400 mb-8 text-lg">
        Your <b>{days} day</b> progress is safe! You're back in the game.
      </p>

      <button 
        onClick={onContinue}
        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl text-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-cyan-500/20"
      >
        <Zap className="w-5 h-5 fill-current" />
        LET'S GO!
      </button>
    </motion.div>
  );
}