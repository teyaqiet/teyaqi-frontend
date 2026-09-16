"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, AlertTriangle, CheckCircle2, HeartCrack, Clock, LucideIcon } from "lucide-react";
import Link from "next/link";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

// Import Lottie JSON assets
import chilling from "@/public/images/mascot/teyaqi_challenge_availlable.json";
import completed from "@/public/images/mascot/teyaqi_completed.json";
import exhausted from "@/public/images/mascot/teyaqi_exhausted.json";

export type DailyChallengeState = "unplayed" | "streak_risk" | "completed" | "no_lives" | "countdown";

interface DailyChallengeCardProps {
  hasPlayedToday: boolean | string | number;
  livesCount: number;
  /** Optional calculated/regenerated lives from client-side timer hook */
  calculatedLives?: number;
  streakCount: number;
  resetTime: string | null;
}

interface CardTheme {
  bgClass: string;
  badge: string;
  title: string;
  desc: string;
  btnText: string;
  btnStyle: string;
  IconComponent: LucideIcon;
  mascotLottieData: any;
}

const THEMES: Record<DailyChallengeState, CardTheme> = {
  unplayed: {
    bgClass: "bg-gradient-to-br from-[#1b4332] to-[#0d2318] border-emerald-800/40",
    badge: "Daily Challenge",
    title: "Ready for today's challenge?",
    desc: "10 quick trivia questions",
    btnText: "Play Now",
    btnStyle: "bg-[#1db954] text-white hover:bg-[#1aa34a]",
    IconComponent: Zap,
    mascotLottieData: chilling,
  },
  streak_risk: {
    bgClass: "bg-gradient-to-br from-[#4a1805] to-[#1a0802] border-orange-800/40",
    badge: "Streak at Risk!",
    title: "Save your streak!",
    desc: "Don't lose your progress. Play before time expires.",
    btnText: "Save Streak",
    btnStyle: "bg-orange-500 text-white hover:bg-orange-600",
    IconComponent: AlertTriangle,
    mascotLottieData: chilling,
  },
  completed: {
    bgClass: "bg-gradient-to-br from-[#12271e] to-[#0a1812] border-emerald-700/50",
    badge: "Streak Secured Today! 🔥",
    title: "Keep playing for extra XP!",
    desc: "You saved your streak today, but you can keep going for XP.",
    btnText: "Play More for XP",
    btnStyle: "bg-[#1db954] text-white hover:bg-[#1aa34a]",
    IconComponent: CheckCircle2,
    mascotLottieData: completed,
  },
  no_lives: {
    bgClass: "bg-gradient-to-br from-[#1c1326] to-[#0d0814] border-purple-900/40",
    badge: "Out of Lives",
    title: "No Life remaining!",
    desc: "Lives regenerate automatically over time.",
    btnText: "Out of Lives",
    btnStyle: "bg-amber-600/80 text-white cursor-not-allowed opacity-75",
    IconComponent: HeartCrack,
    mascotLottieData: exhausted,
  },
  countdown: {
    bgClass: "bg-gradient-to-br from-[#2a0e35] to-[#120518] border-purple-800/40",
    badge: "Closing Soon",
    title: "The clock is ticking!",
    desc: "Less than 2 hours left to lock in today's rewards.",
    btnText: "Last Chance",
    btnStyle: "bg-purple-600 text-white hover:bg-purple-700",
    IconComponent: Clock,
    mascotLottieData: chilling,
  },
};

export const DailyChallengeCard = ({
  hasPlayedToday,
  livesCount,
  calculatedLives,
  streakCount,
  resetTime,
}: DailyChallengeCardProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Use dynamically calculated lives if provided by a timer hook; fallback to raw livesCount
  const effectiveLives = calculatedLives ?? livesCount;

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculatedState = useMemo<DailyChallengeState>(() => {
    // 1. First, check if already played today so user can keep playing for XP
    const isPlayed =
      hasPlayedToday === true ||
      hasPlayedToday === "true" ||
      hasPlayedToday === 1 ||
      hasPlayedToday === "1";

    if (isPlayed) return "completed";

    // 2. If unplayed, check active/calculated lives count
    if (effectiveLives <= 0) return "no_lives";

    // 3. Check reset countdown & streak risk window
    let targetTimestamp = 0;
    if (resetTime) {
      const parsed = Date.parse(resetTime);
      if (!isNaN(parsed)) targetTimestamp = parsed;
    }

    if (targetTimestamp === 0) {
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      targetTimestamp = midnight.getTime();
    }

    const timeRemainingMs = targetTimestamp - now;
    const hoursRemaining = timeRemainingMs / (1000 * 60 * 60);

    if (timeRemainingMs > 0 && hoursRemaining <= 2) {
      return streakCount > 0 ? "streak_risk" : "countdown";
    }

    return "unplayed";
  }, [hasPlayedToday, effectiveLives, streakCount, resetTime, now]);

  const activeTheme = THEMES[calculatedState];
  const { IconComponent } = activeTheme;

  // Card is interactive in ALL states EXCEPT when out of lives
  const isInteractive = calculatedState !== "no_lives";
  const targetHref = isInteractive ? "/quiz?type=daily&challengeId=daily" : "#";

  return (
    <div className="space-y-3">
      <Link href={targetHref} className={`block no-underline select-none ${!isInteractive ? "pointer-events-none" : ""}`}>
        <motion.div
          whileTap={{ scale: isInteractive ? 0.98 : 1 }}
          className={`relative overflow-hidden ${activeTheme.bgClass} border rounded-2xl p-5 text-white shadow-lg cursor-pointer flex justify-between items-center transition-all min-h-[140px]`}
        >
          {/* Card Details */}
          <div className="space-y-1.5 max-w-[62%] z-10">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md inline-block border border-white/20 backdrop-blur-sm ${
                calculatedState === "streak_risk" ? "animate-pulse bg-red-900/60 text-white" : ""
              }`}
            >
              {activeTheme.badge} {calculatedState === "streak_risk" && `(${streakCount} Days)`}
            </span>

            <h3 className="text-xl font-bold tracking-tight text-white leading-tight pt-1">
              {activeTheme.title}
            </h3>

            <p className="text-slate-300 text-xs font-normal leading-normal">
              {activeTheme.desc}
            </p>
          </div>

          {/* Animated Mascot Container */}
          <div className="absolute right-0 bottom-0 w-36 h-36 pointer-events-none z-20 flex items-center justify-center">
            <Lottie
              key={calculatedState}
              lottieRef={lottieRef}
              animationData={activeTheme.mascotLottieData}
              loop={true}
              autoplay={true}
              className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
            />
          </div>
        </motion.div>
      </Link>

      {/* Main Action Button */}
      <Link href={targetHref} className={`block w-full ${!isInteractive ? "pointer-events-none" : ""}`}>
        <button
          disabled={!isInteractive}
          className={`w-full font-extrabold text-base py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all ${activeTheme.btnStyle}`}
        >
          <IconComponent className="w-5 h-5 fill-current" />
          {activeTheme.btnText}
        </button>
      </Link>
    </div>
  );
};