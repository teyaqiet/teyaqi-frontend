"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Home, Trophy, Gamepad2, History, User } from "lucide-react"; 
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext"; 
import { gameService } from "@/game/services/gameService"; 
import { levelSystem } from "@/game/systems/levelSystem"; 
import { useLifeTimer } from "@/game/hooks/useLifeTimer"; 
import { LivesBar } from "@/components/home/LivesBar";
import { DailyChallengeCard } from "@/components/home/DailyChallengeCard";
import { ChallengeCard } from "@/components/home/ChallengeCard";
import { StreakReveal } from "@/components/StreakReveal"; 
import StreakShowcase from "@/components/StreakShowcase/index";
import { StateView } from "@/components/common/StateView";
import { NetworkGuard } from "@/components/common/NetworkGuard";

const getAssetUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "");
  if (!backendUrl) return path;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      if (url.hostname.includes("ngrok-free.app")) {
        return `${backendUrl}${url.pathname}${url.search}`;
      }
      return path;
    } catch {
      return path;
    }
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath.startsWith("/storage/")) {
    return `${backendUrl}${normalizedPath}`;
  }
  return `${backendUrl}/storage${normalizedPath}`;
};

interface UserStatsState {
  username: string;
  avatar: string; 
  xp: number; 
  level: number; 
  levelTitle: string; 
  nextLevelXp: number;
  streak: number; 
  streakStatus: 'active' | 'frozen' | 'dead' | 'reset';
  lives: number; 
  rank: number; 
  wins: number;
  challenges: any[];
  updatedAt: string | null;
  hasPlayedToday: boolean;
}

export default function HomePage() {
  const { mounted } = useLanguage();
  const [greeting, setGreeting] = useState("GOOD AFTERNOON");
  
  const [dataLoading, setDataLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  
  const initRef = useRef(false); 
  const showcaseFiredRef = useRef(false); 
  
  const [isStreakRevealOpen, setIsStreakRevealOpen] = useState(false);
  const [streakResetTime, setStreakResetTime] = useState<string | null>(null);

  const [showcaseConfig, setShowcaseConfig] = useState<{
    isOpen: boolean;
    days: number;
    status: "active" | "frozen" | "dead";
  }>({
    isOpen: false,
    days: 0,
    status: "active",
  });

  const [userStats, setUserStats] = useState<UserStatsState | null>(null);

  const loadUserData = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true);
    setFetchError(false);
    try {
      const d = await gameService.getUserStats();
      if (d) {
        const streakCount = d.current_streak ?? 0;
        const currentUsername = d.username || d.name || "Player";
        let incomingStreakStatus = d.streak_status || (d.streak_reset_triggered ? 'reset' : null);

        if (streakCount === 0 && (!incomingStreakStatus || incomingStreakStatus === 'active')) {
          incomingStreakStatus = 'dead';
        }

        const safeLocalDismissed = typeof window !== "undefined" && localStorage.getItem(`teyaqi_streak_ack_${currentUsername}`) === "true";

        if (streakCount > 0 && typeof window !== "undefined") {
          localStorage.removeItem(`teyaqi_streak_ack_${currentUsername}`);
        }

        let sStatus: 'active' | 'frozen' | 'dead' | 'reset' = 'active';

        if (incomingStreakStatus === 'reset' || incomingStreakStatus === 'dead') {
          sStatus = incomingStreakStatus as any;
          if (!showcaseFiredRef.current && !safeLocalDismissed) {
            showcaseFiredRef.current = true;
            setShowcaseConfig({ isOpen: true, days: 0, status: "dead" });
          }
        } else if (d.is_streak_frozen === true || d.is_streak_frozen === 1 || incomingStreakStatus === 'frozen') {
          sStatus = 'frozen';
          if (!showcaseFiredRef.current && !safeLocalDismissed) {
            showcaseFiredRef.current = true;
            setShowcaseConfig({ isOpen: true, days: streakCount, status: "frozen" });
          }
        } else if (streakCount > 0) {
          sStatus = 'active';
        }

        const expirationTimestamp = d.next_reset_at || d.reset_time || d.streak_expires_at || null;
        setStreakResetTime(expirationTimestamp);

        // Robust Key Normalization: check all potential backend naming patterns
        const rawPlayed = 
          d.has_played_today ?? 
          d.hasPlayedToday ?? 
          d.daily_completed ?? 
          d.has_played ?? 
          d.played_today ?? 
          false;

        const isPlayedToday = 
          rawPlayed === true || 
          rawPlayed === 1 || 
          rawPlayed === "1" || 
          rawPlayed === "true";

        setUserStats({
          username: currentUsername,
          avatar: d.avatar || "", 
          xp: d.total_xp || 0,
          level: d.level_data?.level || 1,
          levelTitle: d.level_data?.title || "Novice",
          nextLevelXp: d.level_data?.next_level_xp || 1000,
          streak: streakCount,
          streakStatus: sStatus,
          lives: d.daily_lives ?? 0,
          rank: d.global_rank || 0,
          wins: d.total_wins || 0,
          challenges: Array.isArray(d.challenges) ? d.challenges : [],
          updatedAt: d.lives_updated_at || d.updated_at || new Date().toISOString(),
          hasPlayedToday: isPlayedToday
        });

        if (d.just_advanced_streak && streakCount > 0 && !showcaseFiredRef.current && !safeLocalDismissed) {
          showcaseFiredRef.current = true;
          setShowcaseConfig({ isOpen: true, days: streakCount, status: "active" });
        }
      }
    } catch (err) { 
      console.error("Stats Load Error:", err); 
      setFetchError(true);
    } finally { 
      setDataLoading(false); 
    }
  }, []); 

  const handleDismissShowcase = useCallback(() => {
    setShowcaseConfig(prev => ({ ...prev, isOpen: false }));
    if (typeof window !== "undefined" && userStats?.username) {
      localStorage.setItem(`teyaqi_streak_ack_${userStats.username}`, "true");
    }
  }, [userStats?.username]);

  const { percent, timeLeft } = useLifeTimer({
    currentLives: userStats?.lives ?? 0,
    livesUpdatedAt: userStats?.updatedAt ?? null,
    onFinish: () => { loadUserData(true); } 
  });

  const initApp = useCallback(async () => {
    setAuthError(false);
    setFetchError(false);
    try {
      const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null;
      if (tg) {
        tg.ready();
        if (tg.expand) tg.expand();
      }
      const isAuth = await gameService.ensureAuthenticated(tg?.initData || "");
      if (!isAuth) {
        setAuthError(true);
        setDataLoading(false);
        return;
      }
      await loadUserData();
    } catch (err) {
      setAuthError(true);
      setDataLoading(false);
    }
  }, [loadUserData]);

  useEffect(() => { 
    if (!mounted) return;
    if (initRef.current) return;
    initRef.current = true;
    initApp();
  }, [mounted, initApp]);

  // Re-fetch user stats automatically when returning to the tab or refocusing window
  useEffect(() => {
    if (!mounted) return;

    const handleRefresh = () => {
      if (document.visibilityState === "visible") {
        loadUserData(true);
      }
    };

    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
    };
  }, [mounted, loadUserData]);

  useEffect(() => {
    if (!mounted) return;
    const hr = new Date().getHours();
    setGreeting(hr < 12 ? "GOOD MORNING" : hr < 18 ? "GOOD AFTERNOON" : "GOOD EVENING");
  }, [mounted]);

  if (!mounted) return null;

  if (authError) {
    return (
      <div className="min-h-screen w-full bg-[#0d131d] flex items-center justify-center p-6 text-white">
        <StateView
          type="error"
          title="Authentication Failed"
          description="Could not verify Telegram platform data safely. Please restart the application."
          actionLabel="Try Again"
          onAction={() => {
            initRef.current = false;
            initApp();
          }}
        />
      </div>
    );
  }

  const progressPercentage = userStats 
    ? levelSystem.calculateProgress(userStats.xp, userStats.nextLevelXp) 
    : 0;
    
  const activeChallenges = userStats && Array.isArray(userStats.challenges) && userStats.challenges.length > 0 
    ? userStats.challenges 
    : [];

  return (
    <NetworkGuard>
      <div className="h-screen w-full bg-[#0b1019] text-white font-sans antialiased flex flex-col justify-between overflow-hidden">
        
        {/* SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4 max-w-md mx-auto w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* USER PROFILE HEADER BOX */}
          {dataLoading || !userStats ? (
            <div className="bg-[#121a27] rounded-2xl p-3 border border-slate-800/80 flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-800 shrink-0" />
                <div className="space-y-1.5">
                  <div className="w-20 h-2.5 bg-slate-800 rounded" />
                  <div className="w-28 h-4 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="w-14 h-8 bg-slate-800 rounded-xl" />
            </div>
          ) : (
            <div className="bg-[#121a27] rounded-2xl p-3 border border-slate-800/80 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#1db954] overflow-hidden flex items-center justify-center shrink-0 border border-white/10 relative">
                  {userStats.avatar ? (
                    <img src={userStats.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm text-white">
                      {userStats.username.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase leading-tight">{greeting}</p>
                  <h2 className="text-lg font-extrabold text-white leading-tight">
                    {userStats.username}
                  </h2>
                </div>
              </div>
              
              <div 
                onClick={() => setIsStreakRevealOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a2436] border border-slate-700/50 cursor-pointer active:scale-95 transition-all"
              >
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                <span className="text-lg font-black text-white">{userStats.streak}</span>
              </div>
            </div>
          )}

          {/* COMBINED LIVES + PROGRESS STATUS CARD */}
          {dataLoading || !userStats ? (
            <div className="bg-[#121a27] rounded-2xl p-4 border border-slate-800/80 space-y-5 shadow-lg animate-pulse">
              <div className="space-y-2">
                <div className="w-12 h-3 bg-slate-800 rounded" />
                <div className="w-full h-6 bg-slate-800 rounded" />
              </div>
              <div className="space-y-2 pt-1 border-t border-slate-800/50">
                <div className="flex justify-between">
                  <div className="w-24 h-4 bg-slate-800 rounded" />
                  <div className="w-16 h-4 bg-slate-800 rounded" />
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="bg-[#121a27] rounded-2xl p-4 border border-slate-800/80 space-y-5 shadow-lg">
              {/* Lives Section */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">Lives</span>
                <LivesBar lives={userStats.lives} percent={percent} timeLeft={timeLeft || "--:--"} />
              </div>

              {/* Level Progress Section */}
              <div className="space-y-2 pt-1 border-t border-slate-800/50">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Level Progress</span>
                    <h4 className="text-lg font-bold text-white leading-tight">{userStats.levelTitle}</h4>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {`${userStats.xp}/${userStats.nextLevelXp} XP`}
                  </span>
                </div>
                
                <div className="w-full bg-[#1b2638] h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progressPercentage}%` }} 
                    className="h-full rounded-full bg-[#1db954]" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* DAILY CHALLENGE BANNER */}
          {dataLoading || !userStats ? (
            <div className="w-full h-40 bg-[#121a27] rounded-2xl border border-slate-800/80 animate-pulse" />
          ) : (
            <section>
              <DailyChallengeCard 
                hasPlayedToday={userStats.hasPlayedToday}
                livesCount={userStats.lives}
                streakCount={userStats.streak}
                resetTime={streakResetTime} 
              />
            </section>
          )}

          {/* EXPLORE TOPICS SECTION */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-white tracking-tight">Explore Topics</h3>
            
            <div className="flex flex-col gap-3">
              {dataLoading || !userStats ? (
                <>
                  <div className="w-full h-20 bg-[#121a27] rounded-xl border border-slate-800/80 animate-pulse" />
                  <div className="w-full h-20 bg-[#121a27] rounded-xl border border-slate-800/80 animate-pulse" />
                </>
              ) : activeChallenges.length > 0 ? (
                activeChallenges.map((c: any, index: number) => {
                  const normalizedChallenge = {
                    id: c.id ?? index,
                    title: c.title ?? "General Knowledge",
                    reward_xp: c.reward_xp ?? 10,
                    difficulty: c.difficulty ?? "Medium",
                    question_count: c.question_count ?? 5,
                    thumbnail_url: c.thumbnail_url ? getAssetUrl(c.thumbnail_url) : null
                  };
                  return <ChallengeCard key={normalizedChallenge.id} challenge={normalizedChallenge} />;
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 bg-[#121a27] rounded-xl border border-slate-800/50">
                  No challenges available right now.
                </div>
              )}
            </div>
          </section>

          {/* STREAK OVERLAYS */}
          {userStats && (
            <>
              <AnimatePresence>
                {showcaseConfig.isOpen && (
                  <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <StreakShowcase 
                      days={showcaseConfig.days}
                      status={showcaseConfig.status}
                      onContinue={handleDismissShowcase} 
                    />
                  </div>
                )}
              </AnimatePresence>

              <StreakReveal 
                isOpen={isStreakRevealOpen}
                count={userStats.streak}
                status={userStats.streakStatus === 'reset' ? 'dead' : userStats.streakStatus}
                resetTime={streakResetTime}
                onClose={() => setIsStreakRevealOpen(false)}
              />
            </>
          )}
        </div>

        {/* FIXED BOTTOM NAVIGATION BAR */}
        <div className="fixed bottom-0 inset-x-0 bg-[#0c121c]/95 border-t border-slate-800/80 backdrop-blur-lg z-50 py-2 px-6">
          <div className="max-w-md mx-auto flex justify-between items-center text-slate-400">
            <button className="flex flex-col items-center gap-1 text-[#1db954]">
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-slate-200">
              <Trophy className="w-5 h-5" />
              <span className="text-[10px] font-medium">Rank</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-slate-200">
              <Gamepad2 className="w-5 h-5" />
              <span className="text-[10px] font-medium">Play</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-slate-200">
              <History className="w-5 h-5" />
              <span className="text-[10px] font-medium">History</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-slate-200">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Account</span>
            </button>
          </div>
          <div className="text-center text-[10px] text-slate-500 mt-1">@teyaqibot</div>
        </div>
      </div>
    </NetworkGuard>
  );
}