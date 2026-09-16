// components/quiz/QuizTimer.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  timeLeft: number;
  totalTime: number;
}

export default function QuizTimer({ timeLeft, totalTime }: QuizTimerProps) {
  const [isBouncing, setIsBouncing] = useState(false);
  
  const maxTime = totalTime > 0 ? totalTime : 15;
  const percentage = Math.max(0, Math.min(1, timeLeft / maxTime));
  
  const isLowTime = timeLeft <= (maxTime <= 5 ? 2 : 5);
  const isCritical = timeLeft <= (maxTime <= 5 ? 1 : 3);
  
  const radius = 18; 
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - percentage * circumference;

  useEffect(() => {
    if (timeLeft > 0 && timeLeft < maxTime) {
      setIsBouncing(true);
      const timeout = setTimeout(() => setIsBouncing(false), 120);
      return () => clearTimeout(timeout);
    }
  }, [timeLeft, maxTime]);

  const getTimerColor = () => {
    if (percentage > 0.6) return "stroke-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]";
    if (percentage > 0.3) return "stroke-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]";
    return "stroke-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]";
  };

  return (
    <div className={cn(
      "relative w-16 h-16 flex items-center justify-center shrink-0 select-none transition-transform duration-300",
      isCritical && "scale-105"
    )}>
      {isLowTime && timeLeft > 0 && (
        <div className={cn(
          "absolute inset-0 rounded-full border border-red-500/30 animate-ping pointer-events-none",
          isCritical ? "duration-500" : "duration-1000"
        )} />
      )}

      {/* SVG Circular Ring Architecture Explicitly Centered with ViewBox */}
      <svg className="w-full h-full -rotate-90 transform drop-shadow-md" viewBox="0 0 40 40">
        {/* Track Ring Base */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2.5"
          fill="none"
        />
        
        {/* Progress Value Stroke */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset: offset,
            transition: timeLeft === maxTime
              ? "none" 
              : "stroke-dashoffset 1s linear, stroke 0.3s ease" 
          }}
          className={cn("transition-colors duration-300", getTimerColor())}
          strokeLinecap="round"
        />
      </svg>

      {/* Center Metadata Digital Text Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className={cn(
          "font-black text-lg transition-all duration-100 text-white",
          isLowTime && timeLeft > 0 ? "text-red-500" : "text-white",
          isBouncing && "scale-110"
        )}>
          {timeLeft}
        </span>
        <span className={cn(
          "text-[8px] text-slate-400 font-extrabold tracking-widest uppercase mt-0.5 font-sans",
          isLowTime && timeLeft > 0 && "text-red-400 opacity-100 animate-pulse"
        )}>
          Sec
        </span>
      </div>

    </div>
  );
}