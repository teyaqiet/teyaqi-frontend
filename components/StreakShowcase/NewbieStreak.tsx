"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import fireJson from "@/public/images/mascot/Teyaqi_fire_streak.json";

interface StreakProps {
  days: number;
  /** * An array of 7 booleans representing Monday through Sunday completion.
   * Example: [true, true, true, true, false, false, false]
   */
  weeklyHistory: boolean[]; 
  onContinue: () => void;
}

export default function NewbieStreak({ days, weeklyHistory, onContinue }: StreakProps) {
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

  // Fallback array to protect against undefined data arrays
  const history = weeklyHistory || Array(7).fill(false);

  // Get the real current day index to highlight "today" if needed (Monday = 0, ..., Sunday = 6)
  const currentDayIndex = (() => {
    const rawDay = new Date().getDay();
    return rawDay === 0 ? 6 : rawDay - 1;
  })();

  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    const t1 = setTimeout(() => triggerHaptic(20), 200);
    const t2 = setTimeout(() => triggerHaptic([15, 10, 15]), 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.25, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const weekContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { type: "spring", damping: 12 } }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0A0E29] flex flex-col items-center justify-between px-6 py-12 text-center overflow-hidden font-sans select-none">
      
      {/* Top Header Section */}
      <div className="w-full flex justify-end px-4 mt-2">
        <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-orange-500 text-sm">🔥</span>
          <span className="text-white font-extrabold text-sm">{days}</span>
        </div>
      </div>

      {/* Main Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 flex flex-col items-center justify-center w-full max-w-sm"
      >
        {/* Lottie Fire Animation */}
        <motion.div variants={itemVariants} className="w-56 h-56 relative mb-6">
          <Lottie 
            animationData={fireJson} 
            loop={true} 
            className="w-full h-full"
          />
        </motion.div>

        {/* Row of Weekdays driven by database history */}
        <motion.div 
          variants={weekContainerVariants}
          className="flex justify-between items-center gap-2.5 w-full px-2 mb-10"
        >
          {weekdays.map((day, idx) => {
            // Evaluates true or false from your database prop array
            const isCompleted = history[idx] === true;
            const isToday = idx === currentDayIndex;
            
            return (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                <span className={`text-xs font-bold tracking-wider ${
                  isToday ? "text-[#25C48E]" : "text-white/60"
                }`}>
                  {day}
                </span>
                <motion.div
                  variants={circleVariants}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isCompleted ? "bg-[#25C48E]" : "bg-[#25C48E]/20 border border-[#25C48E]/40"
                  }`}
                >
                  {isCompleted && (
                    <motion.svg 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.6 + idx * 0.08, duration: 0.2 }}
                      className="w-5 h-5 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Text Block */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tight">
            {days} Day Streak!
          </h2>
          <p className="text-white/80 text-[15px] leading-relaxed max-w-[280px] mx-auto font-medium">
            The first few days are the hardest.<br />
            You're building a massive habit!
          </p>
        </motion.div>
      </motion.div>

      {/* Continue Button */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 80 }}
        className="w-full max-w-sm px-2"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            triggerHaptic(10);
            onContinue();
          }}
          className="w-full py-4 bg-[#25C48E] text-white font-extrabold text-base tracking-wider rounded-3xl shadow-lg shadow-[#25C48E]/20 hover:bg-[#20b280] active:bg-[#1b996e] transition-colors uppercase"
        >
          Continue
        </motion.button>
      </motion.div>

    </div>
  );
}