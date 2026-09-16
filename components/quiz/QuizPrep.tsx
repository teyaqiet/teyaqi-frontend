"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Timer, CheckCircle2, Award, ChevronLeft } from "lucide-react";
import Lottie from "lottie-react";
import mascotAnimation from "@/public/images/Loading/teyaqi_rotate.json";
import { HeartStamina } from "@/components/HeartStamina";
import { useLifeTimer } from "@/game/hooks/useLifeTimer";
import { gameService } from "@/game/services/gameService";
import { audioService } from "@/game/services/audioService";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface QuizPrepProps {
  onStart: () => void;
  lives: number;
  resetTime: string | null;
  onLivesUpdate: (lives: number, resetTime: string | null) => void;
  totalQuestions?: number;
  timeLimit?: number;
  rewardXp?: number;
}

export default function QuizPrep({ 
  onStart, lives, resetTime, onLivesUpdate,
  totalQuestions = 10, timeLimit = 15, rewardXp = 300
}: QuizPrepProps) {
  const router = useRouter();
  const hasRefreshed = useRef(false);
  const [animatedLives, setAnimatedLives] = useState(lives);
  const savedLang = typeof window !== "undefined" ? (localStorage.getItem("teyaqi_lang") || "en") : "en";

  const { timeLeft, percent } = useLifeTimer({
    currentLives: lives,
    livesUpdatedAt: resetTime,
    onFinish: async () => {
      if (hasRefreshed.current) return;
      hasRefreshed.current = true;
      try {
        const data = await gameService.getDailyQuiz();
        if (data?.lives !== undefined) {
          onLivesUpdate(data.lives, data.resetTime || data.lives_updated_at || null);
        }
      } catch (err) {
        console.error("Timer Refresh Error:", err);
      } finally {
        setTimeout(() => { hasRefreshed.current = false; }, 8000);
      }
    }
  });

  // Handle scroll lock & background audio loop
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    // Start looped preparation background music
    audioService.play("prep", { loop: true });

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      
      // Stop music on unmount
      audioService.stop("prep");
    };
  }, []);

  useEffect(() => {
    const controls = animate(animatedLives, lives, {
      duration: 0.15,
      onUpdate: (val) => setAnimatedLives(Math.round(val)),
    });
    return () => controls.stop();
  }, [lives]);

  const handleStart = () => {
    audioService.stop("prep");
    onStart();
  };

  const handleBack = () => {
    audioService.stop("prep");
    router.back();
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#0b1221] w-full h-[100dvh] flex flex-col items-center justify-between px-6 pt-6 pb-8 select-none overflow-hidden touch-none font-sans">
      
      {/* HEADER: Life Timer */}
      <div className="w-full max-w-[320px] flex flex-col items-center flex-shrink-0">
        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">
          {lives < 5 ? (savedLang === "am" ? "የሚቀጥለው ልብ በ: " : "NEXT LIFE ") + timeLeft : (savedLang === "am" ? "ጉልበት ሙሉ ነው" : "ENERGY FULL")}
        </span>
        <HeartStamina currentLives={animatedLives} percentToNext={percent} />
      </div>

      {/* MASCOT */}
      <div className="w-28 h-28 my-auto flex-shrink-0 flex items-center justify-center">
        <Lottie animationData={mascotAnimation} loop={true} className="w-full h-full object-contain" />
      </div>

      {/* 3D READY TO PLAY CARD */}
      <div className="bg-[#1cd05d] rounded-[2rem] p-5 text-center w-full max-w-[320px] shadow-[0_8px_0_#15a34a] flex-shrink-0 my-auto">
        <h2 className="text-2xl font-black text-white uppercase mb-1">
          {savedLang === "am" ? "ለመጫወት ዝግጁ?" : "Ready To Play?"}
        </h2>
        <p className="text-white font-medium text-xs leading-relaxed opacity-95">
          {savedLang === "am" 
            ? "የዛሬው ፈተና ይጠብቅሃል። በጥንቃቄ መልስ፣ እና ምን ያህል መውጣት እንደምትችል እይ።" 
            : "Today's Challenge Is Waiting. Answer Carefully, Keep Your Streak Alive, And See How Far You Can Climb."}
        </p>
      </div>

      {/* STATS CONTAINER WITH GRADIENT LINES */}
      <div className="w-full max-w-[320px] bg-[#111c2e] border border-white/10 rounded-[2rem] p-4 flex-shrink-0 my-auto">
        <div className="space-y-3">
          <InfoRow icon={<CheckCircle2 size={18} className="text-[#1cd05d]"/>} label="PER ROUND" value={`${totalQuestions} QUESTIONS`} />
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <InfoRow icon={<Timer size={18} className="text-[#1cd05d]"/>} label="TIME LIMIT" value={`${timeLimit} Seconds Each`} />
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <InfoRow icon={<Award size={18} className="text-[#1cd05d]"/>} label="REWARD" value={`${rewardXp}+ XP`} />
        </div>
      </div>

      {/* CONTROLS */}
      <div className="w-full max-w-[320px] flex flex-col items-center gap-3 flex-shrink-0 mt-auto">
        <button
          onClick={handleStart}
          className="w-full py-3.5 bg-white rounded-2xl font-black text-lg text-[#1cd05d] uppercase shadow-[0_6px_0_#cbd5e1] active:shadow-none active:translate-y-[6px] transition-all"
        >
          {savedLang === "am" ? "ጀምር" : "START"}
        </button>

        <button 
          onClick={handleBack} 
          className="text-white/50 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors pt-1"
        >
          {savedLang === "am" ? "ተመለስ" : "Go Back"}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-[#1cd05d]/10 rounded-xl">{icon}</div>
      <div className="text-left">
        <p className="text-[9px] text-white/50 font-bold tracking-widest uppercase">{label}</p>
        <p className="text-white font-black text-xs">{value}</p>
      </div>
    </div>
  );
}