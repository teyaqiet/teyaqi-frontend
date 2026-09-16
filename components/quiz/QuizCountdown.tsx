// C:\Users\msi gp 76\teyaqi-app\components\quiz\QuizCountdown.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/game/hooks/useAudio";

interface QuizCountdownProps {
  onFinished: () => void;
}

export default function QuizCountdown({ onFinished }: QuizCountdownProps) {
  const [count, setCount] = useState(3);
  
  // 💡 Swapped in triggerHaptic here to keep things settings-aware!
  const { playSound, triggerHaptic } = useAudio();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track what we've already played to avoid double firing inside render loops
  const hasPlayedRef = useRef<number | null>(null);

  useEffect(() => {
    if (count > 0) {
      // 🔊 Play main countdown tick sound for numbers 3, 2, 1
      if (hasPlayedRef.current !== count) {
        playSound("tick");
        triggerHaptic("light"); // Smart-gated via useAudio settings logic
        hasPlayedRef.current = count;
      }

      timerRef.current = setTimeout(() => {
        setCount((prev) => prev - 1);
      }, 1000);
    } else {
      // 🔊 Play explosive end tick sound right when "ጀምር!" hits the screen
      if (hasPlayedRef.current !== count) {
        playSound("tickend", 0.9); 
        triggerHaptic("success"); // Smart-gated via useAudio settings logic
        hasPlayedRef.current = count;
      }

      timerRef.current = setTimeout(() => {
        onFinished();
      }, 800);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [count, onFinished, playSound, triggerHaptic]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center overflow-hidden font-black italic">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="relative z-10"
        >
          <span className={`text-9xl md:text-[14rem] select-none ${
            count > 0 ? "text-white" : "text-blue-500"
          }`}>
            {count > 0 ? count : "ጀምር!"}
          </span>
        </motion.div>
      </AnimatePresence>

      <motion.div
        key={`pulse-${count}`}
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute border-4 border-blue-500/20 rounded-full w-64 h-64"
      />
    </div>
  );
}