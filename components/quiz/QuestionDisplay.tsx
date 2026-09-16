"use client";

import { useState, useEffect, useMemo } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export default function QuestionDisplay({ question_text, streak, image_url, isCorrect }: any) {
  const { lang } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPopping, setIsPopping] = useState(false);

  // Reset states when image_url changes
  useEffect(() => {
    setImgError(false);
    setIsLoaded(false);
  }, [image_url]);

  // Handle a single crisp scaling pop animation every time the streak value increments (+1x)
  useEffect(() => {
    if (streak >= 2) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 200); // Quick 200ms scale snap back
      return () => clearTimeout(timer);
    }
  }, [streak]);

  const safeText = useMemo(() => {
    try {
      const parsed = typeof question_text === "string" ? JSON.parse(question_text) : question_text;
      return lang === "am" ? (parsed?.am || "") : (parsed?.en || "");
    } catch (e) {
      return typeof question_text === "string" ? question_text : "";
    }
  }, [question_text, lang]);

  // Determine the aesthetic styling color variants dynamically every two rows
  const getStreakStyles = (currentStreak: number) => {
    if (currentStreak % 4 === 0) {
      // 4x, 8x, 12x... (Ultra Epic State)
      return {
        bg: "bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.6)]",
        text: "text-white",
        flame: "fill-white text-white"
      };
    } else if (currentStreak % 2 === 0) {
      // 2x, 6x, 10x... (Even Baseline State)
      return {
        bg: "bg-slate-900 border-slate-700 shadow-xl",
        text: "text-slate-200",
        flame: "fill-cyan-400 text-cyan-400"
      };
    } else {
      // 3x, 5x, 7x... (Hot Fire Odd State)
      return {
        bg: "bg-amber-500 border-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]",
        text: "text-slate-950",
        flame: "fill-slate-950 text-slate-950"
      };
    }
  };

  const styles = getStreakStyles(streak);
  const showImage = image_url && !imgError;

  return (
    <div className={cn(
      "w-full flex flex-col flex-1 min-h-0",
      isCorrect === false && "animate-shake"
    )}>
      <div className={cn(
        "relative w-full h-full flex-1 flex flex-col transition-all duration-500 backdrop-blur-2xl",
        "bg-transparent border rounded-[2.5rem] p-4 sm:p-6 min-h-0 justify-center",
        streak >= 5 ? "border-yellow-500/40" : "border-white/10",
        isCorrect === true && "border-green-500/60 bg-green-500/10",
        isCorrect === false && "border-red-600/60 bg-red-600/10"
      )}>
        
        {/* Streak Pill - Scales up with immediate hardware acceleration transition when +1x is detected */}
        {streak >= 2 && (
          <div className={cn(
            "absolute top-3 right-5 z-20 px-3 py-1 rounded-full flex items-center gap-1.5 border transition-transform duration-200 ease-out origin-center",
            styles.bg,
            isPopping ? "scale-[1.25]" : "scale-100"
          )}>
            <Flame className={cn("w-3.5 h-3.5", styles.flame)} />
            <span className={cn("font-black italic text-[10px] uppercase tracking-wider", styles.text)}>
              {streak}x Streak
            </span>
          </div>
        )}

        {/* Image Box */}
{showImage && (
  <div className={cn(
    "relative w-full flex-shrink mb-3 rounded-3xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center transition-opacity duration-300 mx-auto max-w-[280px]",
    isLoaded ? "h-[120px] opacity-100" : "h-0 opacity-0"
  )}>
    <img 
      key={image_url} 
      src={image_url} 
      className="max-w-full max-h-full object-contain p-2"
      onLoad={() => setIsLoaded(true)}
      onError={(e) => {
        setImgError(true);
        e.currentTarget.style.display = 'none'; // Safely kills the broken icon instantly
      }}
      alt="Quiz Question"
    />
  </div>
)}

        {/* Text Container */}
        <div className={cn(
          "relative z-10 w-full flex-1 flex flex-col items-center justify-center text-center px-2 min-h-0",
          streak >= 2 && "pt-6"
        )}>
          <h2 className={cn(
            "font-black italic uppercase text-white leading-tight break-words overflow-y-auto w-full", 
            showImage && isLoaded ? "text-[1rem]" : "text-[1.25rem]"
          )}>
            {safeText}
          </h2>
        </div>
      </div>
    </div>
  );
}