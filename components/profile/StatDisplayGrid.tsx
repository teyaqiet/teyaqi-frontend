"use client";

interface StatCardProps {
  label: string;
  value: string | number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-[#0d1630] p-5 rounded-3xl flex flex-col justify-between relative min-h-[115px] text-white group shadow-md">
      {/* Mini Medal Badge Styling from Mock Layout */}
      <div className="absolute top-5 right-5 text-slate-400 group-hover:text-white transition-colors">
        <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <span className="text-3xl font-extrabold tracking-tight block mb-1">
          {value ?? "—"}
        </span>
        <p className="text-xs text-slate-300 font-medium tracking-wide">
          {label}
        </p>
      </div>
    </div>
  );
}

interface StatDisplayGridProps {
  globalRank: number | string;
  currentStreak: number;
  totalWins: number; 
  power: number;     
}

export function StatDisplayGrid({ globalRank, currentStreak, totalWins, power }: StatDisplayGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <StatCard label="All Time Rank" value={`#${globalRank}`} />
      <StatCard label="Current Streak" value={currentStreak} />
      <StatCard label="Quizzes Played" value={totalWins} />
      <StatCard label="Correct Answers" value={power} />
    </div>
  );
}