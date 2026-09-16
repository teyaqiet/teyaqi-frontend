// components/DailyChallenge/MapNode.tsx
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

interface MapNodeProps {
  dayNumber: number;
  status: "completed" | "current" | "locked";
  xOffset: number; // Percentage calculation from page canvas layout
  avatarUrl?: string | null; // Plucked directly from user.avatar database column
}

export default function MapNode({ dayNumber, status, xOffset, avatarUrl }: MapNodeProps) {
  const router = useRouter();
  const displayAvatar = avatarUrl || "/images/day1-avatar.png";
  
  // Interactive temporary warning states
  const [showPlayedWarning, setShowPlayedWarning] = useState(false);
  const [showLockOverlay, setShowLockOverlay] = useState(false);

  const triggerHapticVibrate = (pattern: number | number[]) => {
    // Check if the hardware/browser platform supports haptic API protocols
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleNodeClick = () => {
    if (status === "current") {
      // Light, crisp 15ms tap for valid forward progression navigation
      triggerHapticVibrate(15);
      router.push("/quiz?challengeId=daily");
    } else if (status === "completed") {
      // Standard 40ms bump for interaction notice
      triggerHapticVibrate(40);
      setShowPlayedWarning(true);
      setTimeout(() => setShowPlayedWarning(false), 1500);
    } else if (status === "locked") {
      // Erratic Error Double-Pulse: Vibrate 60ms, Rest 50ms, Vibrate 60ms
      triggerHapticVibrate([60, 50, 60]);
      setShowLockOverlay(true);
      setTimeout(() => setShowLockOverlay(false), 1200);
    }
  };

  return (
    <div className="relative w-full h-28 flex items-center z-10">
      {/* Node Anchor Wrapper */}
      <div 
        className="absolute -translate-x-1/2 flex flex-col items-center transition-all duration-300"
        style={{ left: `${xOffset}%` }}
      >
        
        {/* Dynamic 3D Node Container Stack */}
        <div className="relative flex flex-col items-center group">
          
          {/* FLOATING AVATAR ENGINE WITH NESTED HOVER TO AVOID TRANSFORM CONFLICTS */}
          {status === "current" && (
            <div className="absolute -top-[54px] z-20 w-[66px] h-[66px] select-none pointer-events-none animate-smallsink">
              <div className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-110">
                <Image
                  src={displayAvatar}
                  alt="Player Profile Avatar Position"
                  width={66}
                  height={66}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          )}

          {/* COMPLETED NODE FLOATING BANNER */}
          {status === "completed" && showPlayedWarning && (
            <div className="absolute -top-10 z-30 bg-slate-900 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide whitespace-nowrap shadow-xl animate-fade-in-up">
              Already played!
            </div>
          )}
          
          {/* THE 3D SQUARE BLOCK ENGINE */}
          <button
            onClick={handleNodeClick}
            className={`
              w-[84px] h-[80px] rounded-[20px] flex items-center justify-center
              font-black text-[14px] tracking-wider transition-all select-none uppercase outline-none
              
              /* 3D Depth Layer Styles */
              ${status === "completed" 
                ? "bg-[#1cd05d] text-white border-b-[6px] border-[#16a34a] hover:bg-[#22c55e] active:border-b-0 active:mt-[6px]" 
                : ""
              }
              ${status === "current" 
                ? "bg-[#49c5ff] text-white border-b-[6px] border-[#1da1f2] hover:bg-[#5cd0ff] active:border-b-0 active:mt-[6px]" 
                : ""
              }
              ${status === "locked" 
                ? "bg-[#243242] text-[#475569] border-b-[6px] border-[#161f2b] active:border-b-0 active:mt-[6px]" 
                : ""
              }
            `}
          >
            {/* Conditional Node Label Inner View */}
            {status === "locked" && showLockOverlay ? (
              <div className="flex items-center justify-center animate-pulse">
                <Lock className="w-5 h-5 text-red-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
              </div>
            ) : (
              <span className="relative z-10 -mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                Day {dayNumber}
              </span>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}