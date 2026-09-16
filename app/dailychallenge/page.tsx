// app/dailychallenge/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetcher } from "@/lib/api";
import { gameService } from "@/game/services/gameService";
import { calculateRegen } from "@/game/systems/lifeSystem";
import { Loader2, AlertCircle } from "lucide-react";

// Components
import OnboardingGrid from "@/components/DailyChallenge/OnboardingGrid";
import ChallengeNavbar from "@/components/DailyChallenge/ChallengeNavbar";
import WeekHeading from "@/components/DailyChallenge/WeekHeading";
import StreakPath from "@/components/DailyChallenge/StreakPath";
import MapNode from "@/components/DailyChallenge/MapNode";
import MilestoneCard from "@/components/DailyChallenge/MilestoneCard";
import ActionFooter from "@/components/DailyChallenge/ActionFooter";

export default function DailyChallengePage() {
  const router = useRouter();

  // Core Anchor Ref for Focus Navigation
  const currentNodeRef = useRef<HTMLDivElement | null>(null);

  // Core Sync States
  const [syncLoading, setSyncLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // Layout Progression Metrics
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(true);
  const [currentIsland, setCurrentIsland] = useState<number>(1); 
  const [playedToday, setPlayedToday] = useState<boolean>(false);
  
  // Dynamic User Profile Column Tracking
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Navigation State (Tracks what week is actively rendered)
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [actualCurrentWeek, setActualCurrentWeek] = useState<number>(1);

  // Dynamic Calculated Life States
  const [liveLives, setLiveLives] = useState<number>(5);

  const syncEngineProfile = async () => {
    try {
      setSyncLoading(true);
      setSyncError(null);

      const stats = await gameService.getUserStats();
      
      if (!stats) {
        throw new Error("Empty metrics payload returned from account service.");
      }

      setHasOnboarded(stats.has_onboarded ?? true);
      setCurrentIsland(stats.current_island || 1);
      setPlayedToday(stats.played_today || false);
      
      setUserAvatar(stats.avatar || null);

      // Establish current structural week position based on stats
      const calculatedRealWeek = Math.floor(((stats.current_island || 1) - 1) / 7) + 1;
      setActualCurrentWeek(calculatedRealWeek);
      setSelectedWeek(calculatedRealWeek); // Default render to their active week

      const dbLives = stats.lives ?? stats.daily_lives ?? stats.daily_lives_remaining ?? 5;
      const lastUpdateTimestamp = stats.lives_updated_at || stats.updated_at || new Date().toISOString();

      const dynamicHeartMetrics = calculateRegen(dbLives, lastUpdateTimestamp);
      setLiveLives(dynamicHeartMetrics.lives);

    } catch (err: any) {
      console.error("Island lifecycle sync crash:", err);
      setSyncError(err.message || "Could not run local player metadata updates.");
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    syncEngineProfile();
  }, []);

  // AUTOMATIC SCROLL ROUTINE ENGINE
  useEffect(() => {
    if (!syncLoading && currentNodeRef.current) {
      const scrollTimeout = setTimeout(() => {
        currentNodeRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center", // Keeps the node perfectly dead-center in the window view
        });
      }, 180);

      return () => clearTimeout(scrollTimeout);
    }
  }, [syncLoading, selectedWeek]);

  const handleLaunchDailyQuizPage = () => {
    if (liveLives <= 0) {
      alert("Cannot start challenge! Your heart balance pool is completely empty.");
      return;
    }
    router.push("/quiz?challengeId=daily");
  };

const handleCompleteOnboarding = async (
  categoryIds: number[]
): Promise<boolean> => {
  try {
    console.log("🚀 Saving onboarding:", categoryIds);

    const response = await fetcher<{
      status: string;
      message?: string;
    }>("/api/user/onboard", {
      method: "POST",
      body: JSON.stringify({
        avatar: userAvatar || "default",
        gender: "male",
        category_ids: categoryIds,
      }),
    });

    if (response?.status !== "success") {
      throw new Error(
        response?.message || "Onboarding failed."
      );
    }

    console.log("✅ Onboarding saved successfully.");

    // Only change UI state AFTER backend confirms success
    await syncEngineProfile();

    return true;
  } catch (error) {
    console.error("❌ Onboarding completion failed:", error);
    return false;
  }
};

  if (syncError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <p className="text-sm text-slate-400 mb-4">{syncError}</p>
        <button onClick={syncEngineProfile} className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white">
          Retry Sync
        </button>
      </div>
    );
  }

  if (!hasOnboarded) {
    return (
      <main className="min-h-screen bg-slate-950">
        <OnboardingGrid onSave={handleCompleteOnboarding} />
      </main>
    );
  }

  // --- RENDERING METRIC CONFIGURATIONS ---
  const isViewingHistory = selectedWeek < actualCurrentWeek;

  const weekSubtitle = isViewingHistory
    ? "Reviewing your historical progress trail."
    : "Every streak begins with one challenge.";

  const startDay = (selectedWeek - 1) * 7 + 1;
  const targetDaysArray = Array.from({ length: 7 }, (_, i) => startDay + i);

  const getDynamicXOffset = (dayNum: number) => {
    const weeklyIndex = (dayNum - 1) % 7; 
    const centerPoint = 50; 
    const amplitude = 20;   
    const xOffset = centerPoint + Math.sin((weeklyIndex * Math.PI) / 3) * amplitude;
    return Math.round(xOffset);
  };

  const isWeekMilestoneUnlocked = currentIsland > (selectedWeek * 7) || (currentIsland === selectedWeek * 7 && playedToday);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-6 select-none relative overflow-x-hidden">
      
      {/* 1 & 2. STICKY TOP LAYER CONTAINER (Navbar + Header pinned fast) */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-white/5">
        <ChallengeNavbar 
          streakCount={currentIsland} 
          lives={liveLives} 
        />
        <WeekHeading 
          weekNumber={selectedWeek} 
          subtitle={weekSubtitle} 
          actualCurrentWeek={actualCurrentWeek}
          onWeekChange={setSelectedWeek}
        />
      </div>

      {/* 3. CORE MAP TRACK CANVAS LAYER */}
      {/* pt-[144px] clears the pinned headers exactly so nodes don't slide under them */}
      <div className="w-full min-h-screen pt-[144px] pb-32 relative transition-all duration-300">
        
        {/* Focused Map Track View Spinner Overlay */}
        {syncLoading && (
          <div className="absolute inset-0 top-[144px] flex flex-col items-center justify-center bg-slate-950/80 z-30 transition-all duration-200">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Syncing Map Data...
            </span>
          </div>
        )}

        <StreakPath key={selectedWeek}>
          {targetDaysArray.map((dayNum) => {
            let status: "completed" | "current" | "locked" = "locked";
            
            if (dayNum < currentIsland) {
              status = "completed";
            } else if (dayNum === currentIsland) {
              status = "current";
            }

            const isCurrentNode = status === "current";

            return (
              <div 
                key={dayNum} 
                ref={isCurrentNode ? currentNodeRef : null}
                className="w-full h-28 flex items-center justify-center relative scroll-mt-40"
              >
                <MapNode
                  dayNumber={dayNum}
                  status={status}
                  xOffset={getDynamicXOffset(dayNum)}
                  avatarUrl={userAvatar}
                />
              </div>
            );
          })}

          {/* Clean Inline Milestone Card Container */}
          <div className="w-full flex items-center justify-center pt-8 pb-12 px-4">
            <MilestoneCard 
              weekNumber={selectedWeek}
              isCompleted={isWeekMilestoneUnlocked}
              onNextWeek={() => {
                if (selectedWeek < actualCurrentWeek) {
                  setSelectedWeek(selectedWeek + 1);
                }
              }}
            />
          </div>
        </StreakPath>
      </div>

      {/* 4. STICKY BOTTOM ACTION FOOTER */}
      <ActionFooter 
        onLaunchGame={handleLaunchDailyQuizPage} 
        disabled={liveLives <= 0 || isViewingHistory} 
      />
    </main>
  );
}