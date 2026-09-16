"use client";

import { ChevronLeft, Flame } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChallengeNavbarProps {
  streakCount: number; // Forwards the dynamic DB record directly
  lives: number;
}

export default function ChallengeNavbar({ streakCount, lives }: ChallengeNavbarProps) {
  const router = useRouter();

  return (
    <nav className="w-full bg-[#1cd05d] px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
      {/* 1. Functional Back Button */}
      <button 
            onClick={() => router.push("/")}
            className="p-2 bg-slate-950/20 hover:bg-slate-950/30 rounded-xl transition-colors"
            aria-label="Go to home"
            >
            <ChevronLeft className="w-6 h-6 text-white" />
            </button>

      {/* 2. Central Streak Badge - Displays raw dynamic count */}
      <div className="flex items-center gap-2 bg-slate-950/40 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
        <Flame className="w-5 h-5 text-orange-500 fill-orange-500 drop-shadow-[0_2px_3px_rgba(234,179,8,0.7)]" />
        <span className="text-white font-bold text-sm tracking-wide">
          {streakCount} Days Streak
        </span>
      </div>

      {/* 3. Lives / Hearts Badge */}
      <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-white/10 min-w-[60px] justify-center shadow-inner">
        <span className="text-base drop-shadow-[0_2px_3px_rgba(239,68,68,0.5)]">❤️</span>
        <span className="text-white font-black text-sm">{lives}</span>
      </div>
    </nav>
  );
}