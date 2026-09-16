// components/quiz/ComboToast.tsx
"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export default function ComboToast({ streak }: { streak: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation every time streak increases, provided it's at least 3
    if (streak >= 3) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [streak]); // Reacts to every streak change

  if (!isVisible) return null;

  const currentBonus = streak === 3 ? 30 : 10; // Logic for bonus points

  return (
    <div className="flex justify-center w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs shadow-xl flex items-center gap-1.5 border border-amber-400">
        <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
        <span className="uppercase tracking-widest">+{currentBonus}XP BONUS</span>
      </div>
    </div>
  );
}