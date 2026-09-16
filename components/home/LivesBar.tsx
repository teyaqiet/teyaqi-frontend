"use client";

import { Heart } from "lucide-react";

interface Props {
  lives: number;
  percent: number;
  timeLeft: string;
}

export const LivesBar = ({ lives, percent, timeLeft }: Props) => {
  const maxLives = 5;
  const isFull = lives >= maxLives;

  return (
    <div className="flex items-center justify-between w-full select-none">
      {/* Red Hearts Container */}
      <div className="flex items-center gap-2">
        {Array.from({ length: maxLives }).map((_, i) => {
          const isFilled = i < lives;
          const isPartial = i === lives && percent > 0 && !isFull;

          return (
            <div key={i} className="relative w-6 h-6 flex items-center justify-center">
              {/* Empty/Base Dark Heart */}
              <Heart className={`w-6 h-6 ${isFilled ? "text-red-500 fill-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-slate-700 fill-[#1a2434]"}`} />
              
              {/* Bottom-to-Top Filling Animation Layer */}
              {isPartial && (
                <div 
                  className="absolute bottom-0 left-0 right-0 overflow-hidden transition-all duration-300 flex items-end justify-center" 
                  style={{ height: `${percent}%` }}
                >
                  <Heart className="w-6 h-6 text-red-500 fill-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timer / Status Display */}
      <div className="text-right shrink-0">
        {isFull ? (
          <span className="text-sm font-black uppercase tracking-wider text-emerald-400">
            Full
          </span>
        ) : (
          <div className="flex flex-col items-end leading-none">
            <span className="text-base font-bold text-white tracking-tight tabular-nums block leading-tight">
              {timeLeft}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
              Next Life
            </span>
          </div>
        )}
      </div>
    </div>
  );
};