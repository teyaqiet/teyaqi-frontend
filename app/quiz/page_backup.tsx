"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "@/game/hooks/useGame";
import { useAudio } from "@/game/hooks/useAudio";
import { useGameSync } from "@/game/hooks/useGameSync";
import { useTelegram } from "@/game/hooks/useTelegram";
import { useQuizEffects } from "@/game/hooks/useQuizEffects";
import { useLanguage } from "@/context/LanguageContext";
import { calculateRegen } from "@/game/systems/lifeSystem";
import { AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Loader2, AlertCircle } from "lucide-react";
import { gameService, ChallengeStartPayload } from "@/game/services/gameService";

// UI Components
import OptionList from "@/components/quiz/OptionList";
import FeedbackOverlay from "@/components/quiz/FeedbackOverlay";
import ComboToast from "@/components/quiz/ComboToast";
import QuizResult from "@/components/QuizResult";
import QuizPrep from "@/components/quiz/QuizPrep";
import QuizCountdown from "@/components/quiz/QuizCountdown";
import GameOver from "@/components/GameOver";
import OutOfLives from "@/components/OutOfLives";

// Streak Component Directory Module
import NewbieStreak from "@/components/StreakShowcase/NewbieStreak";

interface ChallengePreview {
  totalQuestions: number;
  timeLimit: number;
  timeMode: "per_session" | "per_question";
  rewardXp: number;
  rewardCoins: number;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get('challengeId');
  
  const { playSound, unlockAudio } = useAudio();
  const { triggerHaptic } = useTelegram();
  const { lang } = useLanguage();
  const game = useGame();
  
  const { getFeedbackText } = useQuizEffects(game.timeLeft, game.status, game.isCorrect, lang);
  
  useGameSync(game, game.dispatch);

  const [loading, setLoading] = useState(true);
  const [showPrep, setShowPrep] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [previewData, setPreviewData] = useState<ChallengePreview | null>(null);
  const challengePayloadRef = useRef<ChallengeStartPayload | null>(null);

  // --- DYNAMIC DATA STREAM STATES ---
  const [levels, setLevels] = useState<any[]>([]);
  const [userTotalXp, setUserTotalXp] = useState<number>(0);

  // 🔄 LINEAR POST-GAME PIPELINE STATE MACHINE
  const [postGameStage, setPostGameStage] = useState<"result" | "streak">("result");
  const [fetchingStats, setFetchingStats] = useState(false);

  const [postGameShowcase, setPostGameShowcase] = useState<{
    days: number;
    weeklyHistory: boolean[];
  }>({
    days: 0,
    weeklyHistory: Array(7).fill(false)
  });

  // Read autoStart parameter
  const autoStart = searchParams.get('autoStart');

  useEffect(() => {
    if (!challengeId) {
      router.push("/"); 
      return;
    }

    let isMounted = true;

    async function fetchChallengeDetails() {
      try {
        if (isMounted) setError(null);
        
        let config: any = null;
        const stats = await gameService.getUserStats();

        if (isMounted && stats) {
          setUserTotalXp(stats.xp ?? stats.total_xp ?? 0);
          if (stats.levels) {
            setLevels(stats.levels);
          }
        }

        try {
          if (challengeId === "daily") {
            config = await gameService.getDailyQuiz();
          } else {
            config = await gameService.startChallenge(challengeId);
          }
        } catch (err: any) {
          if (err?.status === 403 || err?.lives === 0 || err?.data?.lives === 0) {
            const errorData = err.data || err;
            game.dispatch({
              type: "PRELOAD_CHALLENGE_META",
              payload: { 
                questions: [], 
                timeLimit: 15, 
                timeMode: "per_question",
                lives: 0,
                resetTime: errorData.next_reset_at || null
              }
            });
            return;
          }
          throw err;
        }

        if (!isMounted) return;

        if (config) {
          const resolvedConfig = config.data || config;
          challengePayloadRef.current = resolvedConfig;

          if (resolvedConfig.levels && levels.length === 0) {
            setLevels(resolvedConfig.levels);
          }

          setPreviewData({
            totalQuestions: resolvedConfig.questions?.length || resolvedConfig.totalQuestions || 10,
            timeLimit: resolvedConfig.timeLimit || 15,
            timeMode: resolvedConfig.timeMode || "per_question",
            rewardXp: challengeId === "daily" ? 15 : (resolvedConfig.rewardXp || 10),
            rewardCoins: challengeId === "daily" ? 5 : (resolvedConfig.rewardCoins || 0),
          });
          
          const rawDbLives = resolvedConfig.lives ?? stats?.lives ?? stats?.daily_lives ?? 5;
          const lastUpdateTimestamp = stats?.lives_updated_at || stats?.updated_at || new Date().toISOString();
          const dynamicHeartMetrics = calculateRegen(rawDbLives, lastUpdateTimestamp);

          const resolvedLives = dynamicHeartMetrics.lives;
          const resolvedResetTime = resolvedConfig.resetTime || stats?.next_reset_at || stats?.lives_updated_at || null;

          if (resolvedConfig.questions) {
            game.dispatch({
              type: "PRELOAD_CHALLENGE_META",
              payload: { 
                questions: resolvedConfig.questions, 
                timeLimit: resolvedConfig.timeLimit || 15, 
                timeMode: resolvedConfig.timeMode || "per_question",
                lives: resolvedLives,
                resetTime: resolvedResetTime
              }
            });

            // 🚀 Bypasses Prep Screen if autoStart is true and lives > 0
            if (autoStart === 'true' && resolvedLives > 0) {
              unlockAudio();
              setShowPrep(false);
              setShowCountdown(true);
            }
          }
        } else {
          throw new Error("No payload config generated by target endpoint metadata.");
        }
      } catch (err: any) {
        console.error("Failed loading configuration rules metadata:", err);
        if (isMounted) {
          setError(err.message || "Failed to fetch rules configuration data.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchChallengeDetails();

    return () => {
      isMounted = false;
    };
  }, [challengeId, autoStart, router, levels.length]);

  // Pre-fetch metrics when the game hits completed state so they are ready for the streak modal transition
  useEffect(() => {
    if (game.status === "completed" && !fetchingStats) {
      setFetchingStats(true);
      async function prefetchMetrics() {
        try {
          const updatedStats = await gameService.getUserStats();
          if (updatedStats) {
            setUserTotalXp(updatedStats.xp ?? updatedStats.total_xp ?? 0);
            
            const currentStreakCount = updatedStats.current_streak ?? 0;
            
            // Fallback Engine: Parse history if API returns it, otherwise build it manually matching current index
            let activeHistoryArray = updatedStats.weekly_history;
            
            if (!activeHistoryArray) {
              const rawDay = new Date().getDay();
              const currentDayIndex = rawDay === 0 ? 6 : rawDay - 1;
              activeHistoryArray = Array(7).fill(false).map((_, idx) => idx <= currentDayIndex);
            }

            setPostGameShowcase({
              days: currentStreakCount,
              weeklyHistory: activeHistoryArray
            });
          }
        } catch (err) {
          console.error("Failed loading matching telemetry endpoints:", err);
        }
      }
      prefetchMetrics();
    }
  }, [game.status]);

  const handleSelect = (isCorrectAnswer: boolean, key: string) => {
    if (game.isCorrect !== null || game.status !== "playing") return;
    
    playSound(isCorrectAnswer ? "correct" : "wrong");
    
    if (isCorrectAnswer) {
      const nextStreak = game.streak + 1;
      if (nextStreak >= 3) {
        triggerHaptic("heavy");
        setTimeout(() => triggerHaptic("medium"), 100);
      } else {
        triggerHaptic("success");
      }
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 }, zIndex: 999 });
    } else {
      triggerHaptic("error");
    }
    
    const dynamicFeedback = getFeedbackText(
      isCorrectAnswer, 
      game.currentQuestionIndex, 
      game.lives, 
      game.streak
    );
    
    game.submitAnswer(isCorrectAnswer, key, dynamicFeedback);
  };

  const handleCountdownFinished = async () => {
    if (!challengeId) return;
    setError(null);

    try {
      const config = challengePayloadRef.current;
      
      if (config?.questions && config.questions.length > 0) {
        const stats = await gameService.getUserStats();
        
        const lives = calculateRegen(
          stats?.lives ?? stats?.daily_lives ?? 5, 
          stats?.lives_updated_at || stats?.updated_at || new Date().toISOString()
        ).lives;
        
        const sr = stats?.sr ?? 50;

        game.startChallengeGame(
          config.questions,
          challengeId === "daily" ? null : config.attemptId,
          config.timeMode || "per_question",
          config.timeLimit || 15,
          sr,
          lives,
          previewData?.rewardXp ?? 10,
          previewData?.rewardCoins ?? 0,
          challengeId === "daily" ? config.sessionId : null 
        );
          
        setShowCountdown(false);
      } else {
        throw new Error("No operational quiz sets found under this profile.");
      }
    } catch (err: any) {
      console.error("Critical Start Error:", err);
      setShowCountdown(false); 
      setShowPrep(true); 
      setError(err.message || "Failed to start challenge. Please go back and try again.");
    }
  };

  const handleExitNavigation = () => {
    router.push("/");
  };

  const handleResultContinueAction = () => {
    if (challengeId === "daily") {
      setPostGameStage("streak");
    } else {
      handleExitNavigation();
    }
  };

  if (loading) {
    return (
      <div className="h-[100dvh] bg-[#050714] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );
  }

  if (error && game.status === "idle" && showPrep) {
    return (
      <div className="h-[100dvh] bg-[#050714] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tight text-white">Initialization Error</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <button 
            onClick={() => router.push(challengeId === "daily" ? "/dailychallenge" : "/")}
            className="w-full py-3.5 bg-white text-slate-950 rounded-xl font-black uppercase tracking-wider text-sm active:scale-95 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (game.status === "gameover") return <GameOver score={game.xp} onComplete={handleExitNavigation} />;
  
  // 🏆 POST-MATCH STRATEGY ROUTER STAGE
  if (game.status === "completed") {
    if (postGameStage === "streak") {
      return (
        <div className="h-[100dvh] bg-[#050714] flex items-center justify-center relative">
          <div className="fixed inset-0 bg-[#0A0E29] z-[9999] flex items-center justify-center">
            <NewbieStreak 
              days={postGameShowcase.days}
              weeklyHistory={postGameShowcase.weeklyHistory}
              onContinue={handleExitNavigation} 
            />
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-full w-full">
        <QuizResult 
          score={game.xp}
          userTotalXp={userTotalXp}
          levels={levels}
          correctCount={game.correctCount}
          total={game.questions.length}
          isDailyChallenge={challengeId === "daily"}
          onContinue={handleResultContinueAction}
        />
      </div>
    );
  }

  if (showPrep && game.status === "idle") {
    if (game.lives <= 0) {
      return (
        <div className="relative h-full w-full">
          <OutOfLives />
        </div>
      );
    }

    return (
      <div className="relative h-full w-full">
        <QuizPrep 
          onStart={() => { unlockAudio(); setShowPrep(false); setShowCountdown(true); }} 
          lives={game.lives}
          resetTime={game.resetTime || null}
          onLivesUpdate={(newLives: number, newResetTime: string | null) => {
            game.dispatch({ type: "UPDATE_LIVES", payload: { lives: newLives, resetTime: newResetTime } });
          }}
          totalQuestions={previewData?.totalQuestions}
          timeLimit={previewData?.timeLimit}
          timeMode={previewData?.timeMode}
          rewardXp={previewData?.rewardXp}
        />
      </div>
    );
  }

  if (showCountdown) return <QuizCountdown onFinished={handleCountdownFinished} />;

  const currentQ = game.questions[game.currentQuestionIndex];
  const timeLimit = previewData?.timeLimit || 15;
  const strokeDashoffset = 113 - (113 * game.timeLeft) / timeLimit;

  return (
    <div className="h-[100dvh] w-full bg-[#05091d] text-white flex flex-col justify-between px-5 py-6 relative overflow-hidden select-none">
      
      {game.feedback && (
        <div className="fixed inset-0 pointer-events-none z-[300] flex items-center justify-center px-6">
          <FeedbackOverlay 
            key={game.currentQuestionIndex} 
            feedback={game.feedback} 
            isTimeUp={game.timeLeft === 0 && game.isCorrect === null} 
            currentIndex={game.currentQuestionIndex} 
          />
        </div>
      )}

      <header className="w-full max-w-md mx-auto flex items-center justify-between shrink-0 z-10">
        <div className="flex flex-col">
          <span className="text-emerald-500 text-[10px] font-extrabold uppercase tracking-wide">Question</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-emerald-400 text-xl font-black">
              {String(game.currentQuestionIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-slate-600 font-bold text-xs">/{game.questions.length}</span>
          </div>
        </div>

        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" className="stroke-white/10 fill-none" strokeWidth="2.5" />
            <circle 
              cx="20" cy="20" r="18" 
              className="stroke-emerald-400 fill-none transition-all duration-1000 ease-linear" 
              strokeWidth="2.5" 
              strokeDasharray="113"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
            <span className="text-white text-base font-black">{game.timeLeft}</span>
            <span className="text-[7px] text-slate-400 font-extrabold tracking-widest uppercase mt-0.5">Sec</span>
          </div>
        </div>

        <div className="bg-[#0b102b] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-inner shrink-0">
          <span className="text-rose-500 text-sm animate-pulse">❤️</span>
          <span className="text-white text-sm font-black">{game.lives}</span>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto flex-1 flex items-center justify-center my-3 min-h-0 relative z-10">
        <div className="w-full bg-[#0a0f2d] border border-emerald-500/30 rounded-[2rem] p-5 text-center shadow-2xl relative flex flex-col items-center justify-center gap-3 min-h-[180px] pt-8 max-h-[280px]">
          
          {game.streak >= 2 && (
            <div 
              key={`streak-badge-${game.streak}`} 
              className="absolute -top-2.5 right-6 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md animate-bounce z-20"
            >
              {game.streak}X in a row
            </div>
          )}

          {currentQ?.image_url && (
            <div className="w-full max-h-[110px] rounded-xl overflow-hidden bg-slate-950/40 flex items-center justify-center shrink-0">
              <img 
                src={currentQ.image_url} 
                alt="Quiz Asset Context" 
                className="max-w-full max-h-[110px] object-contain p-1"
                loading="eager"
              />
            </div>
          )}

          <div className="w-full overflow-y-auto px-1 max-h-full">
            <h2 className="text-white text-base sm:text-lg font-black tracking-tight leading-snug">
              {currentQ?.question_text}
            </h2>
          </div>
        </div>
      </main>

      <section className="w-full max-w-md mx-auto shrink-0 z-10 my-1">
        <OptionList 
          question={currentQ} 
          isAnswered={game.isCorrect !== null} 
          onSelect={handleSelect} 
          selectedOption={game.selectedOption} 
        />
      </section>

      <footer className="w-full max-w-md mx-auto shrink-0 pt-2 flex flex-col gap-2 z-10">
        <div className="w-full flex justify-center h-8 pointer-events-none">
           <ComboToast streak={game.streak} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start">
            <span className="text-cyan-400 text-[9px] font-black uppercase tracking-widest">Total XP</span>
            <div className="flex items-center gap-1">
              <span className="text-cyan-400 text-lg animate-pulse">⚡</span>
              <span className="text-white text-xl font-black tracking-tight">{game.xp}</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="h-[100dvh] bg-[#050714] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}