// components/DailyChallenge/MilestoneCard.tsx
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface MilestoneCardProps {
  weekNumber: number;
  isCompleted: boolean;
  onNextWeek?: () => void; // Callback to trigger state shift
}

export default function MilestoneCard({ weekNumber, isCompleted, onNextWeek }: MilestoneCardProps) {
  const title = isCompleted
    ? `Week ${weekNumber} Complete!`
    : `Week ${weekNumber} Reward`;

  const subtitle = isCompleted
    ? "You've crushed this week's trail! Ready for the next run?"
    : `Complete all 7 days of Week ${weekNumber} to unlock!`;

  return (
    <div className="w-full max-w-[340px] mx-auto select-none transition-all duration-300 relative z-20 transform hover:scale-[1.01]">
      <div 
        className={`
          rounded-[24px] p-4 flex flex-col gap-3 shadow-lg border-2 transition-all duration-300 overflow-hidden relative
          ${isCompleted 
            ? "bg-[#49c5ff] border-white/20 text-[#0d233a]" 
            : "bg-[#1e293b] border-slate-800 text-slate-400"
          }
        `}
      >
        {/* Core Info Row */}
        <div className="flex items-center gap-4">
          {/* Left Side: Branded Image Asset Frame */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            {isCompleted ? (
              <Image
                src="/images/loading/teyaqi_loader.png"
                alt={`Week ${weekNumber} Milestone Complete`}
                width={70}
                height={70}
                priority
                className="object-contain transform scale-110"
              />
            ) : (
              <div className="w-18 h-18 rounded-2xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-center relative shadow-inner overflow-visible">
                <Image
                  src="/images/loading/Teyaqi_loader.png"
                  alt={`Week ${weekNumber} Milestone Locked`}
                  width={70}
                  height={70}
                  priority
                  className="object-contain filter grayscale opacity-40 brightness-75 transform scale-105"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs shadow-md">
                  🔒
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Informational Context Block */}
          <div className="flex flex-col text-left justify-center pr-1 flex-1">
            <h3 
              className={`
                font-black text-[18px] leading-tight tracking-tight
                ${isCompleted ? "text-[#0d233a]" : "text-slate-200"}
              `}
            >
              {title}
            </h3>
            <p 
              className={`
                text-[12px] font-bold leading-snug mt-0.5
                ${isCompleted ? "text-[#144265]" : "text-slate-400"}
              `}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Action Row: Shows up cleanly only when unlocked */}
        {isCompleted && onNextWeek && (
          <button
            onClick={onNextWeek}
            className="w-full mt-1 py-2.5 px-4 bg-[#0d233a] hover:bg-[#143252] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 tracking-wide transition-all active:scale-[0.98] shadow-md group"
          >
            Next Week
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}