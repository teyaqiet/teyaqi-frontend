"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Trophy, Play, Grid, User } from "lucide-react"; 
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "@/context/LanguageContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, mounted } = useLanguage();

  // 📝 Exact 5 items from your design blueprint
  const navItems = [
    { name: t.nav_home || "HOME", href: "/", icon: Home },
    { name: t.nav_rank || "RANK", href: "/leaderboard", icon: Trophy },
    { name: t.nav_play || "PLAY", href: "/dailychallenge", icon: Play }, 
    { name: t.nav_challenge || "CHALLENGE", href: "/challenges", icon: Grid }, 
    { name: t.nav_user || "PROFILE", href: "/profile", icon: User },
  ];

  // 🚀 Proactive App-Level Prefetching Strategy
  useEffect(() => {
    if (mounted) {
      navItems.forEach((item) => {
        router.prefetch(item.href);
      });
    }
  }, [router, mounted]);

  // Hide navigation overlay cleanly ONLY on true fullscreen gameplay engines
  if (pathname.startsWith("/quiz")) {
    return null;
  }

  if (!mounted) return null;

  // ⚡ OPTIMIZATION: Trigger Telegram native haptic pulse on tab changes
  const handleTabPress = () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
    }
  };

  return (
    <nav 
      id="bottom-nav" 
      className="fixed bottom-0 left-0 right-0 w-full bg-[#090d22] border-t border-white/5 rounded-t-[1.75rem] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgba(0,0,0,0.4)] will-change-transform z-50"
    >
      {/* Wrapped and locked within your maximum mobile layout width framework */}
      <div className="max-w-md mx-auto h-20 flex items-center justify-around px-2">
        {navItems.map((item) => {
          // Robust checking strategy ensuring matching child strings flag true
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              prefetch={true} // Forces dynamic routing chunks to pre-cache in production
              onClick={handleTabPress}
              className="flex flex-col items-center justify-center w-full h-full select-none group transition-transform active:scale-95"
            >
              <div className="flex flex-col items-center gap-1">
                {/* Clean, minimalist iconography with active status transitions */}
                <item.icon 
                  className={cn(
                    "w-6 h-6 transition-all duration-200 ease-in-out", 
                    isActive 
                      ? "text-[#10b981] scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                      : "text-slate-500/80 group-hover:text-slate-400" 
                  )} 
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                
                {/* Rigid uppercase textual styling block */}
                <span className={cn(
                  "text-[10px] font-black tracking-wider transition-colors duration-200 ease-in-out", 
                  isActive 
                    ? "text-[#10b981]" 
                    : "text-slate-500 group-hover:text-slate-400"
                )}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}