"use client";

import { cn } from "@/lib/utils";

interface Props {
  feedback: {
    text: string | null;
    isCorrect: boolean | null;
    qIndex: number;
  } | null;
  currentIndex: number;
  isTimeUp?: boolean;
}

export default function FeedbackOverlay({
  feedback,
  currentIndex,
  isTimeUp,
}: Props) {
  if (!feedback?.text && !isTimeUp) return null;
  if (feedback && feedback.qIndex !== currentIndex && !isTimeUp) return null;

  const isSuccess = feedback?.isCorrect === true && !isTimeUp;

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center bg-transparent">
      <div className="animate-float-up flex flex-col items-center px-4">
        
        {/* --- THE HUD TEXT --- */}
        <h2 className={cn(
          "font-black uppercase text-4xl tracking-tighter text-center leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
          isSuccess ? "text-emerald-400" : "text-rose-500"
        )}>
          {isTimeUp ? "ጊዜ አልቋል!" : feedback?.text}
        </h2>

        {/* --- ACCENT INDICATOR BAR --- */}
        <div className={cn(
          "h-1 w-10 mt-3 rounded-full transition-all duration-300",
          isSuccess 
            ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]" 
            : "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
        )} />
      </div>
    </div>
  );
}