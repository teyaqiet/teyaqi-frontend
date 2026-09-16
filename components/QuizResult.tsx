"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";

// --- AUDIO SERVICE ---
import { audioService } from "@/game/services/audioService";

// --- MASCOT ANIMATION FILES ---
import perfectMascot from "@/public/images/mascot/teyaqi_celebrate.json";    // 100% Accuracy
import highMascot from "@/public/images/mascot/teyaqi_applaude.json";       // >= 80% Accuracy
import midMascot from "@/public/images/mascot/teyaqi_thumbUp.json";        // >= 50% Accuracy
import lowMascot from "@/public/images/mascot/teyaqi_Reading_book.json";    // < 50% Accuracy
import failedMascot from "@/public/images/mascot/teyaqi_Reading_book.json"; // < 10% Accuracy

import { XpProgressBar } from "@/components/quiz/Result/XpProgressBar";
import { StatsGrid } from "@/components/quiz/Result/StatsGrid";
import { useLanguage } from "@/context/LanguageContext";

interface LevelTier {
  id: number;
  level_number: number;
  title: string;
  min_xp: number;
  hex_color: string;
}

interface QuizResultProps {
  score?: number;         
  userTotalXp: number;        
  levels: LevelTier[];        
  correctCount?: number;  
  total?: number;          
  timeSpent?: number;    
  isDailyChallenge?: boolean;
  onContinue: () => void;
}

export default function QuizResult({ 
  score = 148, 
  userTotalXp,
  levels = [],
  correctCount = 10, 
  total = 12, 
  timeSpent = 57,
  isDailyChallenge = false,
  onContinue
}: QuizResultProps) {
  
  const router = useRouter();
  const { lang, mounted } = useLanguage();
  const accuracy = Math.round((correctCount / (total || 1)) * 100);
  
  const [timelineStep, setTimelineStep] = useState<"mascot" | "hero" | "xp" | "stats_and_buttons">("mascot");

  const triggerHaptic = (ms = 15) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, []);

  const content = useMemo(() => {
    const isAmharic = lang === "am";
    
    if (accuracy === 100) {
      return { 
        title: isAmharic ? "እንከን የለሽ!" : "Flawless!", 
        desc: isAmharic ? "ፍጹም የሆነ አፈጻጸም! ሁሉንም ጥያቄዎች በትክክል መልሰሃል።" : "Absolute perfection. You completely dominated this round!", 
        color: "#1cd05d",
        animation: perfectMascot 
      };
    }
    if (accuracy >= 80) {
      return { 
        title: isAmharic ? "ድንቅ ስራ!" : "Superb Job!", 
        desc: isAmharic ? "በጣም ጥሩ አፈጻጸም! እውቀትህ ከፍተኛ ደረጃ ላይ እያረፈ ነው።" : "Magnificent work! Your knowledge is hitting peak levels.", 
        color: "#3b82f6",
        animation: highMascot
      };
    }
    if (accuracy >= 50) {
      return { 
        title: isAmharic ? "ቀጥልበት!" : "Keep Climbing!", 
        desc: isAmharic ? "ጥሩ ሙከራ ነው። ጥቂት ስህተቶች ቢኖሩም በደንብ አልፈኸዋል!" : "Solid performance. A few tricky traps, but you powered through!", 
        color: "#eab308",
        animation: midMascot
      };
    }
    if (accuracy >= 10) {
      return { 
        title: isAmharic ? "መማሪያ ጊዜ!" : "Learning Mode!", 
        desc: isAmharic ? "ስህተቶች የእድገት መሰላል ናቸው። በሚቀጥለው ዙር ታሸንፋለህ!" : "Mistakes are just raw data for growth. Let's get the next one!", 
        color: "#ef4444",
        animation: lowMascot
      };
    }

    return {
      title: isAmharic ? "አይዞህ!" : "Tough Round!",
      desc: isAmharic ? "ተስፋ አትቁረጥ! እንደገና በመሞከር እውቀትህን ማሳደግ ትችላለህ።" : "Don't sweat it! Dust off the dust and let's jump right back in.",
      color: "#f43f5e",
      animation: failedMascot
    };
  }, [accuracy, lang]);

  // Handle timeline animations and audio triggering via audioService
  useEffect(() => {
    triggerHaptic(30);
    
    // Play complete sound effect immediately via AudioService
    audioService.play("complete");

    const heroTimer = setTimeout(() => {
      setTimelineStep("hero");
      triggerHaptic(15);
    }, 1000);

    const xpTimer = setTimeout(() => {
      setTimelineStep("xp");
      triggerHaptic(15);
      
      // Play xploader sound effect precisely when the progress bar mounts
      audioService.play("xploader");
    }, 2200);

    const statsTimer = setTimeout(() => {
      setTimelineStep("stats_and_buttons");
      triggerHaptic(25);
      
      // Play gamescore sound effect precisely when the stats grid reveals
      audioService.play("gamescore");
    }, 5500);

    return () => {
      clearTimeout(heroTimer);
      clearTimeout(xpTimer);
      clearTimeout(statsTimer);
    };
  }, []);

  const handleTelegramShare = () => {
    const localizedShare = {
      en: `🎯 I just scored ${score} points with ${correctCount} out of ${total} correct answers on Teyaqi! Can you beat my high score? 🚀\n\n👉 Play now on @devteyaqibot`,
      am: `🎯 በጠያቂ ላይ ከ ${total} ውስጥ ${correctCount} ጥያቄዎችን በትክክል መልሼ ${score} ነጥብ አስመዝግቤያለሁ! የእኔን ከፍተኛ ውጤት ማሸነፍ ትችልክ? 🚀\n\n👉 አሁኑኑ በ @devteyaqibot ይጫወቱ`
    };

    const shareText = lang === "am" ? localizedShare.am : localizedShare.en;
    const botUrl = "https://t.me/devteyaqibot";
    const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(shareText)}`;

    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tgApp = (window as any).Telegram.WebApp;
      if (tgApp.openTelegramLink) {
        tgApp.openTelegramLink(tgShareUrl);
        return;
      }
    }
    
    if (typeof window !== "undefined") {
      window.open(tgShareUrl, "_blank");
    }
  };

  const handleQuit = () => {
    router.push("/");
  };

  const primaryButtonText = useMemo(() => {
    if (isDailyChallenge) {
      return lang === "am" ? "ነጥብ ሰብስብ" : "Claim XP";
    }
    return accuracy >= 80 
      ? (lang === "am" ? "ቀጣይ ዙር" : "Next Round") 
      : (lang === "am" ? "ሌላ ይሞክሩ" : "Try Another");
  }, [isDailyChallenge, accuracy, lang]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-[#0c1322] w-full h-[100dvh] flex flex-col items-center justify-between px-6 pt-8 pb-6 text-white select-none overflow-hidden font-sans touch-none">
      
      <div className="w-full max-w-sm text-center flex flex-col items-center mt-2 flex-shrink-0 min-h-[85px]">
        <AnimatePresence>
          {timelineStep !== "mascot" && (
            <motion.div
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              <h1 
                className="text-3xl font-black tracking-tight uppercase mb-1 drop-shadow-sm"
                style={{ color: content.color }}
              >
                {content.title}
              </h1>
              
              <p className="text-xs font-medium px-4 text-slate-300 max-w-xs leading-snug">
                {content.desc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center my-auto flex-shrink-0">
        <motion.div 
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="w-90 h-90 z-10 relative"
        >
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
          <Lottie 
            animationData={content.animation} 
            loop={true} 
            className="w-full h-full object-contain" 
          />
        </motion.div>
      </div>

      <div className="w-full max-w-sm px-2 flex flex-col justify-center min-h-[140px] my-auto flex-shrink-0">
        <AnimatePresence mode="wait">
          {timelineStep === "xp" && (
            <motion.div 
              key="xp-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-[#162238] p-4 rounded-2xl border border-slate-700/40 shadow-inner"
            >
              <div className="flex justify-between items-center mb-1 px-1">
                <span className="text-[11px] font-black tracking-wider uppercase text-slate-400">
                  {lang === "am" ? "የተገኘ XP" : "XP Earned"}
                </span>
              </div>
              <XpProgressBar 
                score={score} 
                userTotalXp={userTotalXp} 
                levels={levels} 
                startXpAnimation={true} 
              />
            </motion.div>
          )}

          {timelineStep === "stats_and_buttons" && (
            <motion.div 
              key="stats-panel"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="w-full"
            >
              <StatsGrid 
                correctCount={correctCount} 
                total={total} 
                score={score} 
                timeSpent={timeSpent} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-2 mt-auto min-h-[140px] justify-end flex-shrink-0">
        <AnimatePresence>
          {timelineStep === "stats_and_buttons" && (
            <motion.div
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.2 }}
              className="w-full flex flex-col gap-2"
            >
              <button
                onClick={handleTelegramShare}
                className="w-full py-3 bg-[#162238] border border-slate-700/60 text-slate-200 rounded-2xl font-bold text-sm text-center shadow-[0_3px_0_#0f172a] active:translate-y-[2px] active:shadow-none transition-all"
              >
                {lang === "am" ? "ለጓደኛዎ ያጋሩ" : "Share to Friends"}
              </button>

              <button
                onClick={onContinue}
                className="w-full py-3.5 bg-[#1cd05d] text-white rounded-2xl font-black text-lg tracking-wide shadow-[0_4px_0_#159c43] active:translate-y-[3px] active:shadow-[0_1px_0_#159c43] text-center transition-all duration-75"
              >
                {primaryButtonText}
              </button>

              <button 
                onClick={handleQuit}
                className="text-white font-bold text-xs uppercase tracking-widest text-center pt-2 opacity-40 hover:opacity-80 transition-opacity duration-200"
              >
                {lang === "am" ? "ውጣ" : "Quit"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}