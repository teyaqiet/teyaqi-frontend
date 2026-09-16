'use client';

import React from "react";
import BottomNav from "@/components/BottomNav";
import { FriendProvider } from "@/context/FriendContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FriendProvider>
      {/* 
        FIXED: Removed manual scroll tracking properties. We force a crisp 100dvh viewport, 
        isolate positioning context, and let mobile webkit handle inertia acceleration smoothly.
      */}
      <div className="max-w-md mx-auto h-[100dvh] w-full relative overflow-hidden bg-[#090d22] flex flex-col">
        <main className="w-full flex-1 overflow-y-auto overflow-x-hidden scroll-smooth antialiased">
          {children}
        </main>
        <BottomNav />
      </div>
    </FriendProvider>
  );
}