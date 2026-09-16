"use client";

import React, { useState, useEffect } from "react";
import { useLifeTimer } from "@/game/hooks/useLifeTimer";
import { Heart, Timer, RefreshCcw, Home, Loader2 } from "lucide-react";
import { gameService } from "@/game/services/gameService";
import { useRouter } from "next/navigation";

interface OutOfLivesProps {
  currentLives?: number;
  maxLives?: number;
  livesUpdatedAt?: string | number | null;
  resetTime?: string | null; // Kept for backwards compatibility if passed from parent
  onRefill: (data: {
    questions: any[];
    sessionId: number | string;
    lives: number;
    sr: number;
  }) => void;
}

export default function OutOfLives({
  currentLives = 0,
  maxLives = 5,
  livesUpdatedAt: initialLivesUpdatedAt,
  resetTime,
  onRefill,
}: OutOfLivesProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  
  // Track the timestamp used for calculating 30-min boundary ticks
  const [activeLivesUpdatedAt, setActiveLivesUpdatedAt] = useState<string | number | null>(
    initialLivesUpdatedAt || resetTime || null
  );

  /**
   * Sync prop changes to local state
   */
  useEffect(() => {
    if (initialLivesUpdatedAt || resetTime) {
      setActiveLivesUpdatedAt(initialLivesUpdatedAt || resetTime || null);
    } else {
      // If mounted without a baseline timestamp, perform an immediate silent check
      handleCheckStatus();
    }
  }, [initialLivesUpdatedAt, resetTime]);

  /**
   * TIMER HOOK integration:
   * Uses the updated options signature required by useLifeTimer.ts
   */
  const { timeLeft, percent } = useLifeTimer({
    currentLives,
    maxLives,
    livesUpdatedAt: activeLivesUpdatedAt,
    onFinish: async () => {
      // Automatically attempt a status check when a 30-minute block completes
      await handleCheckStatus();
    },
  });

  /**
   * MANUAL / AUTOMATIC CHECK:
   * Catches 403 responses gracefully and extracts the timestamp baseline.
   */
  const handleCheckStatus = async () => {
    if (isChecking) return;
    setIsChecking(true);

    try {
      const data = await gameService.getDailyQuiz();

      // If lives were recovered
      if (data?.lives > 0) {
        onRefill({
          questions: data.questions,
          sessionId: data.sessionId,
          lives: data.lives,
          sr: data.sr,
        });
        return;
      }

      // Update timestamp baseline if still 0 lives
      if (data?.lives_updated_at || data?.resetTime) {
        setActiveLivesUpdatedAt(data.lives_updated_at || data.resetTime);
      }
    } catch (err: any) {
      // Intercept expected HTTP 403 (out of lives) payload from Laravel/Node backend
      const errorData = err?.data || err?.response?.data || err;
      const fallbackTimestamp = errorData?.next_reset_at || errorData?.lives_updated_at || errorData?.resetTime;

      if (fallbackTimestamp) {
        setActiveLivesUpdatedAt(fallbackTimestamp);
      }
    } finally {
      setTimeout(() => setIsChecking(false), 800);
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      
      {/* --- BACKGROUND GLOW --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* --- LIVES (HEARTS) --- */}
      <div className="flex gap-3 mb-10 relative z-10">
        {[...Array(maxLives)].map((_, i) => {
          const heartNumber = i + 1;
          const isFull = heartNumber <= currentLives;
          const isFilling = heartNumber === currentLives + 1 && currentLives < maxLives;

          return (
            <div key={i} className="relative w-10 h-10">
              {/* Background Empty Heart */}
              <Heart className="absolute inset-0 w-full h-full text-slate-800 fill-slate-900" />
              
              {/* Fully Earned Heart */}
              {isFull && (
                <Heart className="absolute inset-0 w-full h-full text-red-500 fill-red-500 animate-in zoom-in duration-300" />
              )}
              
              {/* Progressive Filling Heart */}
              {isFilling && (
                <div
                  className="absolute inset-0 overflow-hidden transition-all duration-1000 ease-linear"
                  style={{ clipPath: `inset(${100 - percent}% 0 0 0)` }}
                >
                  <Heart className="w-10 h-10 text-red-500 fill-red-500 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- UI TEXT --- */}
      <h1 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tighter relative z-10">
        ALL LIVES LOST! 💔
      </h1>

      <p className="text-slate-400 mb-8 max-w-[250px] text-sm font-medium relative z-10">
        Don't worry, you'll be back in the game soon. Grab a coffee while you wait!
      </p>

      {/* --- TIMER CARD --- */}
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-xl rounded-[2.5rem] p-8 w-full max-w-sm mb-10 shadow-2xl relative z-10">
        <div className="flex items-center justify-center gap-2 text-red-500 mb-3">
          <Timer className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Next Life In
          </span>
        </div>

        <div className="text-6xl font-black text-white tabular-nums italic tracking-tighter">
          {timeLeft || "00:00"}
        </div>

        {/* Progress Bar (Visual Sync with Heart) */}
        <div className="mt-6 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000 ease-linear"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
        <button
          onClick={handleCheckStatus}
          disabled={isChecking}
          className="flex items-center justify-center gap-3 bg-white text-slate-950 w-full py-5 rounded-[1.5rem] font-black uppercase italic active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-70"
        >
          {isChecking ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCcw className="w-5 h-5" />
          )}
          <span>Check Status</span>
        </button>

        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors py-2 font-bold uppercase text-[10px] tracking-[0.3em]"
        >
          <Home className="w-3.5 h-3.5" />
          Go Back Home
        </button>
      </div>
    </div>
  );
}