// C:\Users\msi gp 76\teyaqi-app\game\hooks\useQuizEffects.ts

"use client";

import { useEffect, useCallback, useState } from "react";
import { useAudio } from "./useAudio";
import { useTelegram } from "@/game/hooks/useTelegram";

export function useQuizEffects(
  timeLeft: number, 
  status: string, 
  isCorrect: boolean | null, 
  lang: string
) {
  const { playSound, stopSound } = useAudio();
  const { triggerHaptic } = useTelegram();

  // 💡 Safely pull user preferences directly from localStorage on mount/status shifts
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Adjust the key strings ("sound_enabled" / "vibe_enabled") if your settings panel names them differently
      const soundPref = localStorage.getItem("sound_enabled");
      const vibePref = localStorage.getItem("vibe_enabled");

      setSoundEnabled(soundPref !== "false");
      setHapticsEnabled(vibePref !== "false");
    }
  }, [status]); // Sync configurations whenever game state status cycles

  useEffect(() => {
    // Warning state: 5 seconds left
    if (timeLeft === 5 && status === "playing" && isCorrect === null) {
      if (soundEnabled) playSound("warning");
      if (hapticsEnabled) triggerHaptic("medium");
    }

    // Critical state: Time's Up
    if (timeLeft === 0 && status === "playing" && isCorrect === null) {
      if (soundEnabled) playSound("timesup");
      if (hapticsEnabled) triggerHaptic("error");
    }

    // Clean up or stop warnings when question terminates or state shifts
    if (isCorrect !== null || timeLeft === 0 || status !== "playing") {
      stopSound("warning");
    }
  }, [timeLeft, isCorrect, status, playSound, stopSound, triggerHaptic, soundEnabled, hapticsEnabled]);

  /**
   * 🧠 SENSORY CHANNELS DISPATCHER
   */
  const triggerAnswerFeedback = useCallback((
    isCorrectAnswer: boolean,
    currentLives: number,
    currentStreak: number
  ) => {
    if (isCorrectAnswer) {
      // High streak milestone? Boost the celebration!
      if (currentStreak + 1 >= 4) {
        if (soundEnabled) playSound("streak", 1.0);
        if (hapticsEnabled) triggerHaptic("success");
      } else {
        if (soundEnabled) playSound("correct", 0.8);
        if (hapticsEnabled) triggerHaptic("light");
      }
    } else {
      // Out of lives? Game Over!
      if (currentLives <= 1) {
        if (soundEnabled) playSound("gameover", 1.0);
        if (hapticsEnabled) triggerHaptic("error");
      } else {
        if (soundEnabled) playSound("wrong", 0.8);
        if (hapticsEnabled) triggerHaptic("warning");
      }
    }
  }, [playSound, triggerHaptic, soundEnabled, hapticsEnabled]);

  /**
   * 🧠 ADVANCED STATE-AWARE FEEDBACK GENERATOR
   */
  const getFeedbackText = useCallback((
    isCorrectAnswer: boolean, 
    currentQuestionIndex: number, 
    currentLives: number, 
    currentStreak: number
  ) => {
    const qNum = currentQuestionIndex + 1;

    // 🚨 CONDITION 1: CRITICAL LIFE WARNING
    if (!isCorrectAnswer && currentLives === 2) {
      const lifeWarningPool = lang === "am" 
        ? ["በጣም አደገኛ! 1 ህይወት ብቻ ቀረህ! ⚠️", "ተጠንቀቅ! የመጨረሻ ዕድል! 🚨"] 
        : ["Danger! Down to your last life! ⚠️", "Careful! No more safety net! 🚨"];
      return lifeWarningPool[Math.floor(Math.random() * lifeWarningPool.length)];
    }

    // 💀 CONDITION 1B: CRITICAL ELIMINATION
    if (!isCorrectAnswer && currentLives <= 1) {
      const deathPool = lang === "am"
        ? ["የመጨረሻው ልብ ጠፋች! 💔", "ጨዋታው አብቅቷል!"]
        : ["Lost your final heart! 💔", "Game Over!"];
      return deathPool[Math.floor(Math.random() * deathPool.length)];
    }

    // 🔥 CONDITION 2: HIGH-TIER STREAK CELEBRATIONS
    if (isCorrectAnswer && currentStreak >= 4) {
      const streakPool = lang === "am"
        ? [`እሳት ነህ! ${currentStreak} ተከታታይ! 🔥`, "ማቆም አይቻልም! ⚡"]
        : [`You are on fire! ${currentStreak} in a row! 🔥`, "Absolutely unstoppable! ⚡"];
      return streakPool[Math.floor(Math.random() * streakPool.length)];
    }

    // 🎯 CONDITION 3: STANDARD PROGRESSION MILESTONES (1 to 10)
    const feedbackMap: Record<number, { success: string[]; error: string[] }> = {
      1: {
        success: lang === "am" ? ["መልካም ጅማሮ!", "አሪፍ ጅምር!"] : ["Nice Start!", "Good start!"],
        error: lang === "am" ? ["ገና ነው!", "እንደገና ሞክር!"] : ["Warmup mistake!", "Too early!"],
      },
      2: {
        success: lang === "am" ? ["ደረጃ ሁለት! በርታ", "ይለመዳል!"] : ["Level 2 down!", "Moving up!"],
        error: lang === "am" ? ["ገና መጀመርህ እኮ ነው!", "ቀለል አድርገው!"] : ["Early slip up!", "Just a minor bump!"],
      },
      3: {
        success: lang === "am" ? ["ሪትም እየያዝክ ነው!", "በጣም አሪፍ!"] : ["Finding your rhythm!", "Getting warm!"],
        error: lang === "am" ? ["ሶስተኛው ላይ?!", "ትኩረት አድርግ!"] : ["Tripped on 3?!", "Stay focused!"],
      },
      4: {
        success: lang === "am" ? ["እሳት ነህ! 🔥", "ጥሩ ጉዞ!"] : ["You're on fire! 🔥", "Steady pacing!"],
        error: lang === "am" ? ["ማተኮር ያስፈልጋል!", "አይዞህ!"] : ["Focus slipping!", "Shake it off!"],
      },
      5: {
        success: lang === "am" ? ["ግማሽ ደረስክ!", "ቀጥልበት!"] : ["Halfway there!", "Solid progress!"],
        error: lang === "am" ? ["በግማሽ መንገድ?!", "አይዞህ ቀጥል!"] : ["Midway fail!", "Still half left!"],
      },
      6: {
        success: lang === "am" ? ["ግማሹን አለፍክ!", "ጥሩ አቋም!"] : ["Past the halfway mark!", "Keep pushing!"],
        error: lang === "am" ? ["ከግማሽ በኋላ?!", "እንቅስቃሴው እንዳይቀዘቅዝ!"] : ["Dropped it at 6!", "Don't lose momentum!"],
      },
      7: {
        success: lang === "am" ? ["ታላቅ ተዋጊ! ⚔️", "ጠንካራ ጉዞ!"] : ["Great Warrior! ⚔️", "Superb consistency!"],
        error: lang === "am" ? ["ሰባተኛው ላይ?!", "ደክሞሃል?"] : ["Fumbled at 7!", "Catch your breath!"],
      },
      8: {
        success: lang === "am" ? ["ለአሸናፊነት ተቃረብክ!", "ድንቅ ነው!"] : ["Victory is near!", "Phenomenal run!"],
        error: lang === "am" ? ["መጨረሻው ላይ ስትደርስ?!", "ተስፋ አትቁረጥ!"] : ["So close to the end!", "Don't quit now!"],
      },
      9: {
        success: lang === "am" ? ["አንድ ይቀራል! 🚀", "እጅግ በጣም ምርጥ!"] : ["One more to go! 🚀", "Masterclass streak!"],
        error: lang === "am" ? ["ዘጠነኛው ላይ?! ዋው!", "ስትራቴጂ ቀይር!"] : ["Denied at the gates!", "Heartbreak at 9!"],
      },
      10: {
        success: lang === "am" ? ["ታሪካዊ ድል! 🏆", "ንጉስ! 👑"] : ["LEGENDARY! 🏆", "KING STATUS! 👑"],
        error: lang === "am" ? ["በመጨረሻው?!", "ያሳዝናል!"] : ["On the last one?!", "So close!"],
      },
    };

    const stage = feedbackMap[qNum] || feedbackMap[1];
    const pool = isCorrectAnswer ? stage.success : stage.error;
    
    return pool[Math.floor(Math.random() * pool.length)];
  }, [lang]);

  return { 
    getFeedbackText,
    triggerAnswerFeedback 
  };
}