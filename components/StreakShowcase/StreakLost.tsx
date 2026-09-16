"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Lottie from "lottie-react";

import sadCharacterAnimation from "@/public/images/mascot/teyaqi_streak_broken.json";

interface StreakLostProps {
  onContinue: () => void;
  locale?: "am" | "en"; // Added language prop (defaults to Amharic)
}

const TRANSLATIONS = {
  am: {
    badge: "ቀን ተዘሏል",
    titleLine1: "አይይ... የተከታታይ ቀናቶች",
    titleLine2: "ትጋትህ ተቋርጧል!",
    description: "ነገር ግን እስካሁን የለፋኸው አልባከነም። ዛሬ አዲስ ጉዞ እንጀምር!",
    button: "አዲስ ጉዞ ይጀምሩ",
  },
  en: {
    badge: "STREAK BROKEN",
    titleLine1: "Oh no... your",
    titleLine2: "streak is gone.",
    description: "But your progress is still here. Let’s start a new streak today.",
    button: "Start New Streak",
  },
};

export function StreakLost({ onContinue, locale = "am" }: StreakLostProps) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS.am;

  // Trigger a heavy haptic vibration pattern on mount to signify "loss"
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([300, 100, 150]);
    }
  }, []);

  // Soft haptic feedback for button click
  const handleButtonClick = () => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    onContinue();
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#0B0E1B] flex flex-col items-center justify-between p-6 overflow-hidden z-50 select-none">
      
      {/* Background Soft Ambient Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header Badge */}
      <div className="w-full max-w-md flex flex-col items-center text-center mt-12 z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex items-center gap-2 bg-[#221321]/80 border border-red-500/30 px-5 py-2 rounded-full text-red-500 text-xs sm:text-sm font-black tracking-wider uppercase"
        >
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>{t.badge}</span>
        </motion.div>
      </div>

      {/* Center Section: Mascot Lottie Animation */}
      <div className="relative w-full max-w-sm flex items-center justify-center flex-1 my-2 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5, type: "spring" }}
          className="w-72 h-72 flex items-center justify-center"
        >
          <Lottie 
            animationData={sadCharacterAnimation} 
            loop={true} 
            style={{ width: "100%", height: "100%" }}
          />
        </motion.div>
      </div>

      {/* Bottom Section: Headline, Copy, & Action Button */}
      <div className="w-full max-w-md flex flex-col items-center text-center mb-8 px-4 z-10 gap-6">
        
        {/* Main Headline & Body Copy */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {t.titleLine1} <br /> {t.titleLine2}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xs leading-relaxed mx-auto">
            {t.description}
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 120 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleButtonClick}
          className="w-full bg-[#34D399] hover:bg-[#2ECC71] text-[#0B0E1B] font-extrabold text-lg py-4 rounded-full shadow-lg shadow-emerald-500/10 transition-colors duration-200 mt-2"
        >
          {t.button}
        </motion.button>

      </div>

    </div>
  );
}