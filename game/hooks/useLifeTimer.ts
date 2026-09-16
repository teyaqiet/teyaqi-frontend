/**
 * @teyaqi-feat: Teyaqi-Life-Recovery-System
 * @teyaqi-info: Manages the background countdown for regenerating lives. 
 * Calculates the exact remaining minutes/seconds client-side using discrete 
 * 30-minute block boundaries matching the Laravel backend logic.
 */

"use client";

import { useState, useEffect, useRef } from "react";

interface UseLifeTimerOptions {
  currentLives: number;
  maxLives?: number;
  livesUpdatedAt: string | number | null;
  onFinish?: () => void;
}

export const useLifeTimer = (options: UseLifeTimerOptions) => {
  // Defensive guard against null/undefined configurations passed at runtime
  const config = options || { currentLives: 5, maxLives: 5, livesUpdatedAt: null };
  const { currentLives, maxLives = 5, livesUpdatedAt, onFinish } = config;

  const [timeLeft, setTimeLeft] = useState("00:00");
  const [percent, setPercent] = useState(100);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasFinished = useRef(false);
  const onFinishRef = useRef(onFinish);

  // Core countdown baseline rule (30 minutes)
  const SINGLE_LIFE_MS = 30 * 60 * 1000; 

  // Guard against stale closures inside execution scopes
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    hasFinished.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Baseline fallback state if user lives are fully topped up or parameters are missing
    if (currentLives >= maxLives || !livesUpdatedAt) {
      setTimeLeft("00:00");
      setPercent(100);
      return;
    }

    // Defensive parsing engine wrapper
    let lastUpdateMs = typeof livesUpdatedAt === "number"
      ? livesUpdatedAt
      : new Date(livesUpdatedAt).getTime();

    // Catch invalid or parsing dates gracefully while network resolves payloads
    if (isNaN(lastUpdateMs)) {
      setTimeLeft("30:00");
      setPercent(0);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const diffMs = now - lastUpdateMs;

      // Handle backwards/forward clock drift issues safely
      if (diffMs < 0) {
        setTimeLeft("30:00");
        setPercent(0);
        return;
      }

      // Calculate millisecond offset until the next discrete life arrives
      const msInPeriod = SINGLE_LIFE_MS;
      const nextHeartInMs = msInPeriod - (diffMs % msInPeriod);

      if (nextHeartInMs <= 0) {
        if (!hasFinished.current) {
          hasFinished.current = true;
          onFinishRef.current?.();
        }
        return;
      }

      // Convert time values to circular percentage indicators
      const elapsed = msInPeriod - nextHeartInMs;
      const nextPercent = (elapsed / msInPeriod) * 100;
      setPercent(Math.min(100, Math.max(0, nextPercent)));

      // Render raw strings to readable MM:SS formats
      const totalSec = Math.floor(nextHeartInMs / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;

      setTimeLeft(
        `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
      );

      // Fire completion update if a 30-minute block has crossed during application sleep
      const totalGainedSinceUpdate = Math.floor(diffMs / msInPeriod);
      if (totalGainedSinceUpdate > 0 && !hasFinished.current) {
        hasFinished.current = true;
        onFinishRef.current?.();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentLives, maxLives, livesUpdatedAt, SINGLE_LIFE_MS]);

  return {
    timeLeft,
    percent,
  };
};