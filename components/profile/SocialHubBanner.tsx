"use client";

import { Users, ChevronRight } from "lucide-react";

interface SocialHubBannerProps {
  requestCount: number;
  onClick: () => void;
}

export function SocialHubBanner({ requestCount, onClick }: SocialHubBannerProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[#0d1630] p-5 rounded-3xl flex items-center justify-between text-white hover:bg-[#121d3e] active:scale-[0.99] transition-all text-left group shadow-md"
    >
      <div className="flex items-center gap-4">
        {/* Rounded Icon Box */}
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center relative shrink-0">
          <Users className="w-6 h-6 text-slate-200 group-hover:text-white transition-colors" />
          
          {requestCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] items-center justify-center font-black">
                {requestCount}
              </span>
            </span>
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-extrabold tracking-tight">Social hub</h3>
          <p className="text-xs text-slate-300 font-medium">
            Manage your friends
          </p>
        </div>
      </div>

      <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white" />
      </div>
    </button>
  );
}