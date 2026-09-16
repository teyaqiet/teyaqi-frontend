// components/quiz/QuizHeader.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import QuizTimer from "./QuizTimer";

interface QuizHeaderProps {
  current: number;
  total: number;
  lives: number;
  timeLeft: number;
}

export default function QuizHeader({ current, total, lives, timeLeft }: QuizHeaderProps) {
  const [isBursting, setIsBursting] = useState(false);
  const prevLivesRef = useRef(lives);

  useEffect(() => {
    if (lives < prevLivesRef.current) {
      setIsBursting(true);
      const timer = setTimeout(() => setIsBursting(false), 600);
      prevLivesRef.current = lives;
      return () => clearTimeout(timer);
    }
    prevLivesRef.current = lives;
  }, [lives]);

  return (
    <div className="flex items-center justify-between w-full shrink-0 mb-4 px-1 select-none z-10">
      
      {/* --- LEFT: PROGRESS INDEX --- */}
      <div className="flex flex-col items-start leading-none gap-0.5">
        <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-wide">
          Question
        </span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-emerald-400 text-2xl font-black tabular-nums tracking-tight">
            {String(current).padStart(2, '0')}
          </span>
          <span className="text-slate-600 font-bold text-sm">/{total}</span>
        </div>
      </div>

      {/* --- CENTER: COUNTDOWN DIAL --- */}
      <div className="relative flex items-center justify-center">
        <div className={cn(
          "absolute inset-0 blur-xl rounded-full transition-all duration-300 -z-10",
          timeLeft <= 5 ? "bg-rose-500/10" : "bg-emerald-500/5"
        )} />
        <QuizTimer timeLeft={timeLeft} totalTime={15} />
      </div>

      {/* --- RIGHT: HEALTH TRACKER (Spec-Matched Pill Frame) --- */}
      <div className={cn(
        "bg-[#0b102b] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 shadow-inner transition-all duration-300",
        lives === 1 && "border-rose-500/30 bg-rose-500/5 animate-pulse",
        isBursting && "animate-heart-burst border-rose-500 scale-105"
      )}>
        <span className={cn(
          "text-rose-500 text-lg select-none transition-transform duration-300 inline-block",
          isBursting && "scale-125 animate-ping"
        )}>
          ❤️
        </span>
        <span className="text-white text-lg font-black tabular-nums leading-none">
          {lives}
        </span>
      </div>

    </div>
  );
}