"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Loader2, 
  RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { gameService } from "@/game/services/gameService";
import { ChallengeCard } from "@/components/home/ChallengeCard";
// ✅ Corrected import path and component name matching your exact component file
import BottomNav from "@/components/BottomNav"; 

const ITEMS_PER_PAGE = 10;

const getAssetUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  const backendUrl = "http://127.0.0.1:8000";

  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (path.includes('ngrok-free.app')) {
      const cleanPath = path.split('ngrok-free.app')[1] || "";
      const storagePrefix = cleanPath.startsWith('/storage') ? "" : "/storage";
      return `${backendUrl}${storagePrefix}${cleanPath}`;
    }
    return path;
  }
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const storagePrefix = normalizedPath.startsWith('/storage') ? "" : "/storage";
  return `${backendUrl}${storagePrefix}${normalizedPath}`;
};

export default function ChallengesPage() {
  const router = useRouter();
  const { mounted } = useLanguage();
  
  const [dataLoading, setDataLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initRef = useRef(false);

  const [allChallenges, setAllChallenges] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);

  // Infinite Scroll Pagination States
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const loadChallengesData = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true);
    try {
      const d = await gameService.getUserStats();
      if (d) {
        setStreak(d.current_streak ?? 0);
        setAllChallenges(Array.isArray(d.challenges) ? d.challenges : []);
        setVisibleCount(ITEMS_PER_PAGE); 
      }
    } catch (err) {
      console.error("Failed to sync challenges view:", err);
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (initRef.current) return;
    initRef.current = true;
    loadChallengesData();
  }, [mounted, loadChallengesData]);

  // Infinite scroll monitoring logic
  useEffect(() => {
    if (isPageLoading || visibleCount >= allChallenges.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingMore) {
          setIsFetchingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, allChallenges.length));
            setIsFetchingMore(false);
          }, 600);
        }
      },
      { threshold: 1.0, rootMargin: "100px" }
    );

    const currentTarget = observerTargetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [allChallenges.length, visibleCount, isFetchingMore]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadChallengesData(true);
  };

  if (!mounted) return null;

  const isPageLoading = dataLoading || isRefreshing;
  const slicedChallenges = allChallenges.slice(0, visibleCount);
  const hasMore = visibleCount < allChallenges.length;

  return (
    <div className="min-h-screen w-full bg-[#090d22] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* Top Header Row */}
      <div className="max-w-md w-full mx-auto px-5 pt-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="w-12 h-12 bg-[#10b981] rounded-xl flex items-center justify-center text-white transition-all active:scale-95 hover:opacity-90"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>
          <h1 className="text-3xl font-black tracking-tight">All Topics</h1>
        </div>
        
        <button 
          onClick={handleManualRefresh} 
          disabled={isPageLoading}
          className="p-2 text-[#10b981] hover:bg-white/5 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-6 h-6 ${isPageLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Container Scroll Feed */}
      <div className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-32 overflow-y-auto no-scrollbar space-y-5">
        
        {/* Compact Summary Module Banner */}
        <div className="bg-[#1b2341]/40 border border-white/5 rounded-[2rem] p-5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Activity Status</p>
              <h3 className="text-lg font-bold text-white">{streak} Day Streak</h3>
            </div>
          </div>
          <div className="bg-[#090d22] px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5 text-xs font-bold text-[#10b981]">
            <Trophy className="w-4 h-4 fill-current" />
            {allChallenges.length} Topics
          </div>
        </div>

        {/* Content Render Tree */}
        <AnimatePresence mode="wait">
          {isPageLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full py-24 flex flex-col items-center justify-center text-slate-400 gap-3 text-sm font-medium"
            >
              <Loader2 className="w-7 h-7 animate-spin text-[#10b981]" />
              <span>Loading Challenges...</span>
            </motion.div>
          ) : (
            <div className="space-y-3.5">
              {slicedChallenges.length > 0 ? (
                <>
                  {slicedChallenges.map((c: any, index: number) => {
                    const rawThumbnailPath = c.thumbnail_url ?? c.thumbnail ?? null;

                    const normalizedChallenge = {
                      id: c.id ?? c.challengeId,
                      title: c.title ?? c.name ?? "Untitled Challenge",
                      reward_xp: c.reward_xp ?? c.xp ?? 0,
                      difficulty: c.difficulty ?? "Normal",
                      question_count: c.question_count ?? c.questions_count ?? c.total_questions ?? 10,
                      thumbnail_url: rawThumbnailPath ? getAssetUrl(rawThumbnailPath) : null
                    };

                    return (
                      <ChallengeCard 
                        key={normalizedChallenge.id || index} 
                        challenge={normalizedChallenge} 
                      />
                    );
                  })}

                  {/* Infinite Scrolling Target Node */}
                  {hasMore && (
                    <div 
                      ref={observerTargetRef} 
                      className="w-full py-6 flex items-center justify-center text-slate-400 text-xs font-semibold gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-[#10b981]" />
                      <span>Loading more topics...</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full text-center py-12 text-slate-400 text-sm font-medium">
                  No topics loaded from server.
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ Corrected layout bar mount */}
      <BottomNav />
    </div>
  );
}