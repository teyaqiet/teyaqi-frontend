"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Component Paths Mapping
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { RankProgressBar } from "@/components/profile/RankProgressBar";
import { StatDisplayGrid } from "@/components/profile/StatDisplayGrid";
import { SocialHubBanner } from "@/components/profile/SocialHubBanner";

// Core Data Hooks
import { fetcher } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useFriends } from "@/context/FriendContext";

interface TeyaqiUser {
  username: string;
  avatar?: string; 
  total_xp: number;
  current_streak: number;
  global_rank: number;
  total_wins: number;
  daily_lives: number;
  level_data: {
    level: number;
    title: string;
    next_level_xp: number;
    color: string;
    current_xp: number;
  };
}

export default function ProfilePage() {
  const { t, mounted } = useLanguage();
  const { pendingRequests = [] } = useFriends() || {}; 
  const router = useRouter();

  const [user, setUser] = useState<TeyaqiUser | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.push("/login");
        return;
      } 

      try {
        setDataLoading(true);
        const response = await fetcher("/api/user");
        if (response?.data) {
          setUser(response.data);
        }
      } catch (err: any) {
        console.error("Profile Fetch Error:", err);
        setError(err.status === 401 ? "Session Expired" : "Connection Failed");
      } finally {
        setDataLoading(false);
      }
    };

    if (mounted) loadProfile();
  }, [mounted, router]);

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#0c132b] flex flex-col items-center justify-center p-6 fixed inset-0">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center">
          <p className="text-red-500 font-bold uppercase text-xs tracking-wider mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Prevent server-side hydration mismatches before engine mounts
  if (!mounted) return null;

  const requestCount = pendingRequests?.length || 0;

  return (
    <div className="min-h-screen w-full bg-[#0c132b] flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* 1. Header Toolbar Interface Layer */}
      <div className="w-full max-w-md mx-auto px-4 z-20 shrink-0">
        <ProfileHeader 
          onBack={() => router.back()} 
          onSettings={() => router.push("/settings")} 
        />
      </div>

      {/* 2. Main High-contrast Panel Frame */}
      <div className="w-full max-w-md mx-auto bg-[#3cd093] rounded-t-[2.5rem] mt-14 relative flex flex-col px-5 pt-2 pb-32 shadow-2xl">
        
        {/* Floating Avatar Card Profile Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          {dataLoading ? (
            <div className="w-24 h-24 bg-white/20 border-4 border-[#3cd093] rounded-[1.8rem] animate-pulse shadow-lg" />
          ) : (
            <div className="w-24 h-24 bg-[#10b981] border-4 border-[#3cd093] rounded-[1.8rem] overflow-hidden shadow-lg flex items-center justify-center relative">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover absolute inset-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className="font-black text-2xl text-white uppercase tracking-tight select-none">
                {(user?.username || "WA").substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Name Header Typography Row */}
        <div className="text-center pt-16 mb-6 shrink-0 flex flex-col items-center justify-center">
          {dataLoading ? (
            <div className="h-8 w-44 bg-white/20 rounded-xl animate-pulse mt-1" />
          ) : (
            <h2 className="text-white text-3xl font-black tracking-tight leading-none">
              {user?.username}
            </h2>
          )}
        </div>

        {/* Component Action Cards List Viewport */}
        <div className="flex flex-col gap-4">
          
          {/* Main Experience/Level Track Bar */}
          {dataLoading ? (
            <div className="w-full h-24 bg-white/10 rounded-[2rem] animate-pulse" />
          ) : (
            <RankProgressBar 
              title={user?.level_data?.title || "Novice"}
              totalXp={user?.total_xp || 0}
              currentXp={user?.level_data?.current_xp || 0}
              nextLevelXp={user?.level_data?.next_level_xp || 1000}
            />
          )}

          {/* Core Analytics Metric Quadrant Block */}
          {dataLoading ? (
            <div className="grid grid-cols-2 gap-3.5 w-full">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-24 bg-white/10 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <StatDisplayGrid 
              globalRank={user?.global_rank || "—"}
              currentStreak={user?.current_streak || 0}
              totalWins={user?.total_wins || 0}
              power={Math.floor((user?.total_xp || 0) / 12)} 
            />
          )}

          {/* Social Routing Utility Banner */}
          {dataLoading ? (
            <div className="w-full h-20 bg-white/10 rounded-2xl animate-pulse" />
          ) : (
            <SocialHubBanner 
              requestCount={requestCount}
              onClick={() => router.push("/social")}
            />
          )}
          
        </div>
      </div>
    </div>
  );
}