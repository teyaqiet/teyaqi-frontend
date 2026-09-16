// components/DailyChallenge/WeekHeading.tsx
import { ArrowUp, ArrowDown } from "lucide-react";

interface WeekHeadingProps {
  weekNumber: number;
  subtitle?: string;
  actualCurrentWeek: number;
  onWeekChange: (week: number) => void;
}

export default function WeekHeading({ 
  weekNumber, 
  subtitle, 
  actualCurrentWeek, 
  onWeekChange 
}: WeekHeadingProps) {
  const isViewingHistory = weekNumber < actualCurrentWeek;

  return (
    <div className="w-full bg-slate-950 border-b border-slate-900 py-6 text-center px-4 relative min-h-[92px] flex flex-col justify-center items-center">
      
      {/* Centered Typography Content */}
      <h2 className="text-white text-xl font-extrabold tracking-wide mb-1">
        Week {weekNumber}
      </h2>
      {subtitle && (
        <p className="text-slate-400 text-xs font-medium tracking-normal opacity-80 max-w-[280px] sm:max-w-none">
          {subtitle}
        </p>
      )}

      {/* Absolute Positioned Action Control Group */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        {!isViewingHistory ? (
          // Renders historical button only if user is past Week 1
          actualCurrentWeek > 1 && (
            <button
              onClick={() => onWeekChange(actualCurrentWeek - 1)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-bold text-slate-300 transition-all active:scale-95 shadow-sm"
            >
             <ArrowUp className="w-3 h-3 text-blue-400" />
              Prev
            </button>
          )
        ) : (
          // Snaps layout view instantly back to their true current progress frame
          <button
            onClick={() => onWeekChange(actualCurrentWeek)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-[11px] font-bold text-blue-400 transition-all active:scale-95 shadow-sm"
          >
            <ArrowDown className="w-3 h-3" />
            Current
          </button>
        )}
      </div>
    </div>
  );
}