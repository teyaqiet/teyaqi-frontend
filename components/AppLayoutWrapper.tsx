'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // --- 🌐 TELEGRAM NATIVE HEADER CONTROLS (BACK ARROW ONLY) ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      if (pathname !== '/') {
        tg.BackButton.show();
      } else {
        tg.BackButton.hide();
      }

      const handleBackClick = () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          router.push('/');
        }
      };

      tg.BackButton.onClick(handleBackClick);

      return () => {
        tg.BackButton.offClick(handleBackClick);
      };
    }
  }, [pathname, router]);

  // --- ⚡ NAV HIDING PATHS ---
  // Added '/challenges' and '/quiz' matches explicitly to secure your live gaming screens
  const navHidingPaths = ['/onboarding', '/welcome', '/quiz', '/challenge', '/dailychallenge'];
  const shouldHideNav = navHidingPaths.some(path => pathname?.startsWith(path));

  return (
    <div className="max-w-md mx-auto h-[100dvh] w-full relative overflow-hidden bg-slate-950 flex flex-col isolation-auto">
      
      {/* 🚀 FIXED: Fixed structural height viewport. No dynamic padding changes means ZERO browser layout recalculation blinks */}
      <main className="flex-1 w-full overflow-y-auto scrollbar-none relative raw-scroller">
        {children}
      </main>

      {/* ⚡ FIXED: Embedded cleanly within the flexbox architecture. 
          Using an animate-friendly height layout container means pages transition instantly 
          without breaking the scroll-view window height rules.
      */}
      <div 
        className={`w-full transition-all duration-200 ease-out shrink-0 overflow-hidden ${
          shouldHideNav ? 'h-0 opacity-0 pointer-events-none' : 'h-20 opacity-100'
        }`}
      >
        <BottomNav />
      </div>
    </div>
  );
}