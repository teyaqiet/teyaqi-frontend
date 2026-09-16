"use client";

import { Flame, Shield } from "lucide-react";
import { StreakStatus } from "@/game/types/gameTypes";

export const StreakBadge = ({ count, status }: { count: number; status: StreakStatus }) => {
  const isActive = status !== 'dead';
  const isFrozen = status === 'frozen';

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-500 ${
      isFrozen 
        ? 'bg-blue-500/10 border-blue-500/30' 
        : isActive 
          ? 'bg-orange-500/10 border-orange-500/30' 
          : 'bg-white/5 border-white/10 opacity-50'
    }`}>
      <div className="relative">
        <Flame 
          size={16} 
          className={`${
            isFrozen ? 'text-blue-400 fill-blue-400' : 
            isActive ? 'text-orange-500 fill-orange-500' : 
            'text-gray-400'
          }`} 
        />
        {isFrozen && (
          <div className="absolute -top-1.5 -right-1.5 text-blue-400">
            <Shield size={10} className="fill-blue-400" />
          </div>
        )}
      </div>
      
      <span className={`text-sm font-black italic tracking-tighter ${
        isFrozen ? 'text-blue-400' : 
        isActive ? 'text-orange-400' : 
        'text-gray-400'
      }`}>
        {count}
      </span>
    </div>
  );
};