"use client";

import { ArrowLeft, Settings } from "lucide-react";

interface ProfileHeaderProps {
  onBack?: () => void;
  onSettings?: () => void;
}

export function ProfileHeader({ onBack, onSettings }: ProfileHeaderProps) {
  return (
    <div className="w-full flex items-center justify-between px-2 py-4 shrink-0">
      <button 
        onClick={onBack} 
        className="text-white hover:opacity-80 active:scale-95 transition-all"
        aria-label="Go back"
      >
        <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
      </button>
      <button 
        onClick={onSettings} 
        className="text-white hover:opacity-80 active:scale-95 transition-all"
        aria-label="Settings"
      >
        <Settings className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
}