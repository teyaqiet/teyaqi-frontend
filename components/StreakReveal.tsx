"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Shield, Clock } from "lucide-react";
import { StreakStatus } from "@/game/types/gameTypes";

interface StreakRevealProps {
  isOpen: boolean;
  count: number;
  status: StreakStatus;
  rewardedFreeze?: boolean;
  resetTime: string | null;
  onClose: () => void;
}

export const StreakReveal = ({ isOpen, count, status, rewardedFreeze, resetTime, onClose }: StreakRevealProps) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>("24:00:00");

  useEffect(() => {
    if (!isOpen) return;

    const calculateCountdown = () => {
      let targetTime = 0;

      // 🛠️ FIX: Attempt to safely parse the server timestamp string
      if (resetTime) {
        const parsed = Date.parse(resetTime);
        if (!isNaN(parsed)) {
          targetTime = parsed;
        }
      }

      // 🛡️ FALLBACK: If server time is missing or invalid, default to client midnight tonight
      if (targetTime === 0) {
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        targetTime = midnight.getTime();
      }

      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeftStr("00:00:00");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const paddedHours = String(hours).padStart(2, "0");
      const paddedMinutes = String(minutes).padStart(2, "0");
      const paddedSeconds = String(seconds).padStart(2, "0");

      setTimeLeftStr(`${paddedHours}:${paddedMinutes}:${paddedSeconds}`);
    };

    // Fire immediately and kick off the interval engine
    calculateCountdown();
    const intervalId = setInterval(calculateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [isOpen, resetTime]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative w-full max-w-sm overflow-hidden bg-gray-900 border border-white/10 rounded-3xl"
          >
            <div className={`absolute -top-24 -left-24 w-48 h-48 blur-[100px] rounded-full ${status === 'frozen' ? 'bg-blue-500/30' : 'bg-orange-500/30'}`} />

            <div className="relative p-8 text-center">
              <div className="relative flex justify-center mb-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    filter: [
                      `drop-shadow(0 0 10px ${status === 'frozen' ? '#60a5fa' : '#f97316'})`,
                      `drop-shadow(0 0 25px ${status === 'frozen' ? '#3b82f6' : '#ea580c'})`,
                      `drop-shadow(0 0 10px ${status === 'frozen' ? '#60a5fa' : '#f97316'})`
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Flame 
                    size={100} 
                    className={`${status === 'frozen' ? 'text-blue-400 fill-blue-400' : 'text-orange-500 fill-orange-500'}`} 
                  />
                </motion.div>

                {status === 'frozen' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-full border-4 border-gray-900"
                  >
                    <Shield size={20} className="text-white fill-white" />
                  </motion.div>
                )}
              </div>

              <h2 className="mb-2 text-4xl font-black text-white italic tracking-tighter uppercase">
                {count} Day Streak!
              </h2>
              
              <p className="mb-6 text-gray-400 font-medium leading-tight">
                {status === 'frozen' 
                  ? "Your Streak Freeze protected your progress!" 
                  : "The fire is burning bright! Come back tomorrow to keep it alive."}
              </p>

              <div className="flex flex-col items-center justify-center p-4 mb-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <Clock size={14} className="text-[#10b981]" />
                  Streak Expires In
                </div>
                <div className="text-3xl font-black tracking-mono text-white tabular-nums">
                  {timeLeftStr}
                </div>
              </div>

              {rewardedFreeze && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-4 p-4 mb-6 text-left bg-blue-500/10 border border-blue-500/30 rounded-2xl"
                >
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Shield size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Milestone Reward</p>
                    <p className="text-sm font-semibold text-white">+1 Streak Freeze Earned</p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={onClose}
                className="w-full py-4 text-lg font-black text-black uppercase transition-all bg-white rounded-2xl active:scale-95"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};