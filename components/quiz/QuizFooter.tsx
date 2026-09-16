"use client";

import { Zap } from "lucide-react";

interface QuizFooterProps {
  score: number;
  sessionId: string | number | null;
}

export default function QuizFooter({ score, sessionId }: QuizFooterProps) {
  return (
    <div className="shrink-0 w-full flex justify-between items-center py-2 select-none">
      
      {/* LEFT ASPECT: XP ACCUMULATION STATS */}
      <div className="flex flex-col gap-0.5 leading-none">
        <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">
          TOTAL SCORE
        </span>
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span className="text-white font-black text-xl tabular-nums tracking-tight">
            {score}
          </span>
        </div>
      </div>

      {/* RIGHT ASPECT: ENGINE METADATA SYMBOLS */}
      <div className="flex flex-col items-end gap-0.5 leading-none opacity-20">
        <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-wider">
          TEYAQI ENGINE V1.0
        </span>
        <span className="text-[8px] font-mono text-slate-500 tracking-normal uppercase">
          ID: {sessionId?.toString().slice(0, 8) || "LOCAL_DEV"}
        </span>
      </div>

    </div>
  );
}