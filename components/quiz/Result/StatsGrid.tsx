"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { HelpCircle, Zap, Clock } from "lucide-react";

interface StatsGridProps {
  correctCount: number;
  total: number;
  score: number;
  timeSpent: number;
}

const triggerImpactHaptic = () => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(15); 
  }
};

export function StatsGrid({ correctCount, total, score, timeSpent }: StatsGridProps) {
  const [countCorrect, setCountCorrect] = useState(0);
  const [countXp, setCountXp] = useState(0);
  const [countTime, setCountTime] = useState(0);

  const [animateIcon1, setAnimateIcon1] = useState(false);
  const [animateIcon2, setAnimateIcon2] = useState(false);
  const [animateIcon3, setAnimateIcon3] = useState(false);

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.12, 
        delayChildren: 0.05 
      }
    }
  };

  const cardChildVariants = {
    hidden: { opacity: 0, scale: 0.6, y: 20 },
    visible: { 
      opacity: 1, 
      scale: [0.6, 1.08, 0.97, 1],
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const textFrameVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, delay: 0.08 }
    }
  };

  const iconVariants = {
    spin: { rotate: 360, scale: [1, 1.25, 1], transition: { duration: 0.45, ease: "easeInOut" } },
    pulse: { scale: [1, 1.3, 1], transition: { duration: 0.35, ease: "backOut" } },
    vibrate: { rotate: [0, -12, 12, -6, 6, 0], transition: { duration: 0.35 } },
    idle: { rotate: 0, scale: 1 }
  };

  const runTicker = (target: number, setter: (v: number) => void, duration = 450) => {
    if (target === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setter(Math.floor(target * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return (
    <motion.div 
      variants={cardContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 gap-3 w-full max-w-[360px]"
    >
      {/* 1. Correct Answers Card */}
      <motion.div 
        variants={cardChildVariants}
        onAnimationComplete={() => {
          triggerImpactHaptic();
          setAnimateIcon1(true);
          runTicker(correctCount, setCountCorrect, 450);
        }}
        className="relative bg-[#0b1120]/50 border border-[#1e293b] rounded-2xl p-3.5 pt-4 pb-5 flex flex-col items-center justify-between h-[136px] text-center will-change-transform"
      >
        <motion.div 
          variants={iconVariants}
          animate={animateIcon1 ? "spin" : "idle"}
          className="w-7 h-7 rounded-full border border-[#1cd05d]/30 flex items-center justify-center bg-[#1cd05d]/5 flex-shrink-0"
        >
          <HelpCircle size={15} className="text-[#1cd05d]" />
        </motion.div>
        
        <motion.div variants={textFrameVariants} className="w-full flex-grow flex flex-col justify-end">
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-tight leading-tight">
            Correct<br/>Answers
          </p>
          <p className="text-[24px] font-black text-white mt-2 leading-none tracking-tight">
            {countCorrect}<span className="text-white/30 text-base font-bold">/{total}</span>
          </p>
        </motion.div>
      </motion.div>

      {/* 2. Total XP Gained Card */}
      <motion.div 
        variants={cardChildVariants}
        onAnimationComplete={() => {
          triggerImpactHaptic();
          setAnimateIcon2(true);
          runTicker(score, setCountXp, 500);
        }}
        className="relative bg-[#0b1120]/50 border border-[#1e293b] rounded-2xl p-3.5 pt-4 pb-5 flex flex-col items-center justify-between h-[136px] text-center will-change-transform"
      >
        <motion.div 
          variants={iconVariants}
          animate={animateIcon2 ? "pulse" : "idle"}
          className="w-7 h-7 rounded-full border border-yellow-500/30 flex items-center justify-center bg-yellow-500/5 flex-shrink-0"
        >
          <Zap size={15} className="text-yellow-400 fill-yellow-400/10" />
        </motion.div>
        
        <motion.div variants={textFrameVariants} className="w-full flex-grow flex flex-col justify-end">
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-tight leading-tight">
            Total<br/>XP Gaind
          </p>
          <p className="text-[24px] font-black text-white mt-2 leading-none tracking-tight">
            {countXp}+
          </p>
        </motion.div>

        {/* Absolute positioned footer to guarantee consistent vertical heights across siblings */}
        <p className="absolute bottom-1.5 left-0 right-0 text-[9px] font-bold text-white/30 tracking-tight uppercase">
          60 Bonus
        </p>
      </motion.div>

      {/* 3. Time Spent Card */}
      <motion.div 
        variants={cardChildVariants}
        onAnimationComplete={() => {
          triggerImpactHaptic();
          setAnimateIcon3(true);
          runTicker(timeSpent, setCountTime, 450);
        }}
        className="relative bg-[#0b1120]/50 border border-[#1e293b] rounded-2xl p-3.5 pt-4 pb-5 flex flex-col items-center justify-between h-[136px] text-center will-change-transform"
      >
        <motion.div 
          variants={iconVariants}
          animate={animateIcon3 ? "vibrate" : "idle"}
          className="w-7 h-7 rounded-full border border-sky-500/30 flex items-center justify-center bg-sky-500/5 flex-shrink-0"
        >
          <Clock size={15} className="text-sky-400" />
        </motion.div>
        
        <motion.div variants={textFrameVariants} className="w-full flex-grow flex flex-col justify-end">
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-tight leading-tight">
            Total<br/>Time Spent
          </p>
          <p className="text-[24px] font-black text-white mt-2 leading-none tracking-tight">
            {countTime}<span className="text-white/40 text-sm font-bold ml-0.5">Sec</span>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}