// components/DailyChallenge/StreakPath.tsx
import React from "react";

interface StreakPathProps {
  children: React.ReactNode;
}

export default function StreakPath({ children }: StreakPathProps) {
  return (
    // Lowered min-h slightly to match the shorter path target line
    <div className="relative w-full max-w-md mx-auto py-12 px-6 overflow-hidden min-h-[800px]">
      {/* Refined Symmetrical Bezier Curve 
        Shorter canvas depth (960) to let the track end precisely behind the milestone card
      */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 400 960" 
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Underlay Border Trace - Terminates cleanly at Y: 920 down the center line (X: 200) */}
        <path
          d="M 200 0 
             C 150 180, 420 100, 150 500 
             C  30 650, 300 700,  180 890"
          stroke="#2d3748"
          strokeWidth="38"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Overlay Path Track */}
        <path
          d="M 200 0 
             C 150 180, 420 100, 150 500 
             C  30 650, 300 700,  180 890"
          stroke="#718096"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Keeps your custom spaced nodes alignment */}
      <div className="relative z-10 flex flex-col gap-20 pt-4">
        {children}
      </div>
    </div>
  );
}