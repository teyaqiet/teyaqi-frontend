"use client";

import {
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";

import {
  Loader2,
  ChevronLeft,
  Share2,
  Users,
  UserPlus,
} from "lucide-react";

import { clsx } from "clsx";
import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { useRouter } from "next/navigation";

// ============================================================
// COMPONENTS
// ============================================================

import RankInsightBanner from "@/components/leaderboard/RankInsightBanner";
import PodiumStage from "@/components/leaderboard/PodiumStage";
import LeaderboardRowItem from "@/components/leaderboard/LeaderboardRowItem";

// ============================================================
// PROJECT HOOKS
// ============================================================

import { useLanguage } from "@/context/LanguageContext";
import { useLeaderboard } from "@/game/hooks/useLeaderboard";
import { useFriends } from "@/context/FriendContext";
import { shareAsImage } from "@/lib/shareService";

// ============================================================
// TYPES
// ============================================================

type LeaderboardTab =
  | "weekly"
  | "all_time"
  | "friends"
  | "streak";

interface LeaderboardUser {
  id: string | number;
  name: string;
  avatar?: string;
  avatar_url?: string;
  total_xp?: number;
  weekly_xp?: number;
  best_streak?: number;
}

export default function LeaderboardPage() {
  const router = useRouter();

  const { mounted } = useLanguage();

  const {
    data,
    loading,
  } = useLeaderboard();

  const {
    friends: myFriendsList = [],
  } = useFriends();

  // ============================================================
  // REFS
  // ============================================================

  const scrollContainerRef =
    useRef<HTMLDivElement>(null);

  const meRef =
    useRef<HTMLDivElement>(null);

  const shareRef =
    useRef<HTMLDivElement>(null);

  const scrollTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  // ============================================================
  // STATE
  // ============================================================

  const [
    activeTab,
    setActiveTab,
  ] = useState<LeaderboardTab>("all_time");

  const [
    isSharing,
    setIsSharing,
  ] = useState(false);

  // ============================================================
  // DETERMINE DATA SOURCE
  // ============================================================

  const leaderboardKey = useMemo(() => {
    if (
      activeTab === "friends" ||
      activeTab === "streak"
    ) {
      return "all_time";
    }

    return activeTab;
  }, [activeTab]);

  const baseData =
    data?.[leaderboardKey];

  // ============================================================
  // CURRENT USER
  // ============================================================

  const currentUser =
    baseData?.current_user ?? null;

  // ============================================================
  // PROCESS LEADERBOARD DATA
  // ============================================================

  const processedData = useMemo(() => {
    if (!baseData) {
      return {
        leaders: [],
        top_three: [],
        current_user: null,
      };
    }

    const allLeaders =
      baseData.leaders ?? [];

    // ----------------------------------------------------------
    // FRIENDS LEADERBOARD
    // ----------------------------------------------------------

    if (activeTab === "friends") {
      const friendIds = new Set(
        myFriendsList.map((friend: any) =>
          String(friend.id)
        )
      );

      const currentUserId =
        currentUser?.id
          ? String(currentUser.id)
          : null;

      const friendLeaders =
        allLeaders.filter(
          (user: LeaderboardUser) => {
            const userId =
              String(user.id);

            return (
              friendIds.has(userId) ||
              userId === currentUserId
            );
          }
        );

      return {
        leaders: friendLeaders,
        top_three:
          friendLeaders.slice(0, 3),
        current_user:
          currentUser,
      };
    }

    // ----------------------------------------------------------
    // STREAK LEADERBOARD
    // ----------------------------------------------------------

    if (activeTab === "streak") {
      const sortedLeaders =
        [...allLeaders].sort(
          (
            a: LeaderboardUser,
            b: LeaderboardUser
          ) =>
            (b.best_streak ?? 0) -
            (a.best_streak ?? 0)
        );

      return {
        leaders: sortedLeaders,
        top_three:
          sortedLeaders.slice(0, 3),
        current_user:
          currentUser,
      };
    }

    // ----------------------------------------------------------
    // STANDARD LEADERBOARD
    // ----------------------------------------------------------

    return {
      leaders: allLeaders,
      top_three:
        allLeaders.slice(0, 3),
      current_user:
        currentUser,
    };
  }, [
    baseData,
    activeTab,
    myFriendsList,
    currentUser,
  ]);

  // ============================================================
  // DERIVED DATA
  // ============================================================

  const leaders =
    processedData.leaders;

  // ============================================================
  // UNIT
  // ============================================================

  const getUnit = (): string => {
    if (activeTab === "streak") {
      return "DAYS";
    }

    return "XP";
  };

  // ============================================================
  // USER VALUE
  // ============================================================

  const getValue = (
    user: LeaderboardUser
  ): number => {
    if (!user) {
      return 0;
    }

    switch (activeTab) {
      case "weekly":
        return user.weekly_xp ?? 0;

      case "streak":
        return user.best_streak ?? 0;

      case "all_time":
      case "friends":
      default:
        return user.total_xp ?? 0;
    }
  };

  // ============================================================
  // CHECK CURRENT USER
  // ============================================================

  const checkIsMe = (
    user: LeaderboardUser
  ): boolean => {
    if (!user || !currentUser) {
      return false;
    }

    return (
      String(user.id) ===
      String(currentUser.id)
    );
  };

  // ============================================================
  // CURRENT USER RANK
  // ============================================================

  const myRank = useMemo(() => {
    if (!currentUser) {
      return 0;
    }

    const index =
      leaders.findIndex(
        (user: LeaderboardUser) =>
          String(user.id) ===
          String(currentUser.id)
      );

    return index >= 0
      ? index + 1
      : 0;
  }, [
    leaders,
    currentUser,
  ]);

  // ============================================================
  // TOP THREE
  // ============================================================

  const topThreeFormatted =
    useMemo(() => {
      return leaders
        .slice(0, 3)
        .map(
          (
            user: LeaderboardUser
          ) => ({
            id: user.id,
            name: user.name,

            avatar:
              user.avatar ||
              user.avatar_url ||
              "",

            avatar_url:
              user.avatar ||
              user.avatar_url ||
              "",

            qp: getValue(user),
          })
        );
    }, [
      leaders,
      activeTab,
    ]);

  // ============================================================
  // REMAINING USERS
  // ============================================================

  const visibleList =
    useMemo(() => {
      if (leaders.length <= 3) {
        return [];
      }

      return leaders.slice(3);
    }, [leaders]);

  // ============================================================
  // SHARE
  // ============================================================

  const handleShare =
    async () => {
      if (
        isSharing ||
        loading ||
        !shareRef.current
      ) {
        return;
      }

      setIsSharing(true);

      try {
        await shareAsImage(
          shareRef,
          myRank
        );
      } catch (error) {
        console.error(
          "Share engine generation failure:",
          error
        );
      } finally {
        setIsSharing(false);
      }
    };

  // ============================================================
  // AUTO SCROLL TO CURRENT USER
  // ============================================================

  useEffect(() => {
    if (
      loading ||
      !mounted
    ) {
      return;
    }

    // Clear any previous timer.
    if (
      scrollTimeoutRef.current
    ) {
      clearTimeout(
        scrollTimeoutRef.current
      );
    }

    scrollTimeoutRef.current =
      setTimeout(() => {
        if (
          meRef.current &&
          scrollContainerRef.current
        ) {
          meRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 400);

    return () => {
      if (
        scrollTimeoutRef.current
      ) {
        clearTimeout(
          scrollTimeoutRef.current
        );

        scrollTimeoutRef.current =
          null;
      }
    };
  }, [
    activeTab,
    loading,
    mounted,
  ]);

  // ============================================================
  // HYDRATION GUARD
  // ============================================================

  if (!mounted) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto flex flex-col bg-[#091529] text-white overflow-hidden relative font-sans select-none">

      {/* ======================================================
          SHARE BUTTON
      ====================================================== */}

      <button
        onClick={handleShare}
        disabled={
          isSharing ||
          loading ||
          !currentUser
        }
        className="absolute top-5 right-4 z-50 p-2.5 bg-[#1CC659] hover:bg-[#159e46] rounded-full shadow-lg active:scale-95 transition-all disabled:opacity-50"
      >
        {isSharing ? (
          <Loader2 className="animate-spin w-5 h-5 text-white" />
        ) : (
          <Share2 className="w-5 h-5 text-white" />
        )}
      </button>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="w-full bg-[#091529] z-50 shrink-0 pb-2">

        <div className="p-4 pt-7 flex items-center relative">

          <button
            onClick={() =>
              router.push("/")
            }
            className="p-2 text-white/90 active:scale-95 transition-transform absolute left-2"
          >
            <ChevronLeft
              size={24}
              className="stroke-[2.5]"
            />
          </button>

          <h1 className="font-black text-2xl tracking-wide text-white mx-auto">
            Leaderboard
          </h1>

        </div>

        {/* ====================================================
            TABS
        ==================================================== */}

        <div className="px-4">

          <div className="flex bg-[#09101E] p-1 rounded-full justify-between w-full border border-white/5">

            {[
              {
                id: "weekly",
                label: "Weekly",
              },
              {
                id: "all_time",
                label: "All Time",
              },
              {
                id: "friends",
                label: "Friends",
              },
              {
                id: "streak",
                label: "Streak",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as LeaderboardTab
                  )
                }
                className={clsx(
                  "flex-1 text-center py-2 rounded-full text-xs font-bold transition-all duration-200 tracking-wide",

                  activeTab === tab.id
                    ? "bg-[#1CC659] text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {tab.label}
              </button>
            ))}

          </div>

        </div>

      </div>

      {/* ======================================================
          SCROLLABLE CONTENT
      ====================================================== */}

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth overscroll-contain pb-24"
      >

        {/* ====================================================
            TOP AREA
        ==================================================== */}

        {loading ? (

          <div className="w-full h-48 flex items-center justify-center">

            <Loader2 className="animate-spin text-[#4CD06B] w-8 h-8" />

          </div>

        ) : (

          <div className="w-full pt-2">

            {/* ================================================
                RANK INSIGHT
            ================================================= */}

            {myRank > 0 && (

              <div className="px-4 mb-2">

                <RankInsightBanner
                  currentRank={myRank}
                  messageText={
                    activeTab === "all_time"
                      ? "One strong session could change your rank."
                      : activeTab === "friends"
                        ? "Keep playing and climb above your friends!"
                        : activeTab === "streak"
                          ? "Consistency is the key to a stronger streak."
                          : "Keep playing to climb this week's ranks!"
                  }
                />

              </div>

            )}

            {/* ================================================
                PODIUM
            ================================================= */}

            {topThreeFormatted.length > 0 && (

              <div className="mb-4">

                <PodiumStage
                  topThreeUsers={
                    topThreeFormatted
                  }
                  currentUserId={
                    currentUser?.id
                  }
                  unit={
                    getUnit()
                  }
                />

              </div>

            )}

          </div>

        )}

        {/* ====================================================
            LEADERBOARD TRAY
        ==================================================== */}

        <div className="bg-[#4CD06B] rounded-t-[32px] pt-5 px-4 min-h-screen relative shadow-[0_-10px_25px_rgba(0,0,0,0.3)] z-30">

          <div className="w-3 h-3 bg-[#4CD06B] rotate-45 mx-auto absolute -top-1.5 left-0 right-0 rounded-sm" />

          <div className="space-y-3 pb-16">

            <AnimatePresence
              mode="popLayout"
              initial={false}
            >

              {/* ==============================================
                  LOADING
              =============================================== */}

              {loading ? (

                Array.from({
                  length: 5,
                }).map((_, index) => (

                  <div
                    key={index}
                    className="w-full h-16 bg-white/10 rounded-2xl animate-pulse"
                  />

                ))

              ) : visibleList.length > 0 ? (

                visibleList.map(
                  (
                    user: LeaderboardUser,
                    index: number
                  ) => {

                    const isMe =
                      checkIsMe(user);

                    const absoluteRank =
                      index + 4;

                    return (

                      <motion.div
                        key={`${activeTab}-${user.id}`}
                        ref={
                          isMe
                            ? meRef
                            : undefined
                        }
                        layout
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.98,
                        }}
                        className="w-full"
                      >

                        <LeaderboardRowItem
                          rank={
                            absoluteRank
                          }
                          user={{
                            id: String(
                              user.id
                            ),

                            name:
                              user.name,

                            avatar_url:
                              user.avatar ||
                              user.avatar_url ||
                              "",
                          }}
                          value={
                            getValue(user)
                          }
                          unit={
                            getUnit()
                          }
                          isMe={
                            isMe
                          }
                        />

                      </motion.div>

                    );
                  }
                )

              ) : activeTab === "friends" ? (

                /* ============================================
                    NO FRIENDS
                ============================================= */

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="flex flex-col items-center justify-center py-12 px-4 text-center text-white"
                >

                  <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mb-4 border border-white/10">

                    <Users
                      className="text-white"
                      size={30}
                      strokeWidth={2}
                    />

                  </div>

                  <h2 className="text-base font-black tracking-wide uppercase">
                    Solo Mission?
                  </h2>

                  <p className="text-xs text-white/80 font-medium mt-1 max-w-[240px] leading-relaxed">
                    Connect with other players to see how you measure up against your inner circle!
                  </p>

                  <button
                    onClick={() =>
                      router.push("/social")
                    }
                    className="mt-6 flex items-center gap-2 bg-[#091529] hover:bg-[#0d1f3d] text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95"
                  >

                    <UserPlus size={16} />

                    Find & Add Friends

                  </button>

                </motion.div>

              ) : (

                /* ============================================
                    EMPTY STATE
                ============================================= */

                <div className="text-center py-12 text-white/60 text-xs font-medium tracking-wide">
                  No additional ranks available.
                </div>

              )}

            </AnimatePresence>

          </div>

        </div>

      </div>

      {/* ======================================================
          HIDDEN SHARE CARD
      ====================================================== */}

      <div className="absolute left-[-9999px] top-0">

        <div
          ref={shareRef}
          className="w-[400px] h-[550px] bg-[#091529] p-10 flex flex-col items-center border-[10px] border-[#4CD06B] relative overflow-hidden"
        >

          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#4CD06B]/10 rounded-full blur-3xl" />

          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#4CD06B]/10 rounded-full blur-3xl" />

          <h2 className="text-white text-5xl font-black tracking-tighter mb-2 mt-8 relative z-10">
            TEYAQI
          </h2>

          <p className="text-[#4CD06B] font-bold uppercase tracking-[0.2em] text-[10px] mb-10">
            Leaderboard Status
          </p>

          <div className="bg-[#09101E] border border-white/10 rounded-[32px] p-8 w-full text-center relative z-10 shadow-2xl">

            <div className="text-[#4CD06B] text-7xl font-black italic mb-2 tracking-tighter">

              #
              {myRank > 0
                ? myRank
                : "N/A"}

            </div>

            <div className="w-10 h-1 bg-[#4CD06B] mx-auto mb-4" />

            <p className="text-white text-2xl font-black uppercase truncate">

              {currentUser?.name ??
                "Player"}

            </p>

            <p className="text-slate-400 font-bold uppercase text-[10px] mt-4 tracking-widest">

              {activeTab.replace(
                "_",
                " "
              )}{" "}
              Ranking

            </p>

          </div>

          <p className="mt-auto text-slate-500 font-black text-[10px] uppercase tracking-widest relative z-10">

            Play on Telegram @TeyaqiBot

          </p>

        </div>

      </div>

      {/* ======================================================
          SCROLLBAR
      ====================================================== */}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

    </div>
  );
}

