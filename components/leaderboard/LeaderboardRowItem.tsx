"use client";

import { clsx } from "clsx";

interface RowUser {
  id: string;
  name: string;
  avatar_url?: string;
}

interface LeaderboardRowItemProps {
  rank: number;
  user: RowUser;
  value: number;
  unit: "XP" | "QP";
  isMe?: boolean;
}

export default function LeaderboardRowItem({ rank, user, value, unit, isMe = false }: LeaderboardRowItemProps) {
  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={clsx(
        "w-full flex items-center justify-between p-3.5 rounded-[24px] transition-all duration-200 border",
        isMe
          ? "bg-[#0E1626] border-white/10 shadow-lg"
          : "bg-white border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      )}
    >
      {/* Left side info block */}
      <div className="flex items-center space-x-3.5">
        
        {/* Dynamic Badge Position Circle Badge Container */}
        <div
          className={clsx(
            "w-6 h-6 rounded-full flex items-center justify-center border text-xs font-black select-none",
            isMe 
              ? "border-[#1CC659] text-[#1CC659] bg-[#1CC659]/5" 
              : "border-slate-300 text-slate-500 bg-transparent"
          )}
        >
          {rank}
        </div>

        {/* Profile Avatar Frame rendering layer block */}
        <div
          className={clsx(
            "w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-lg overflow-hidden shadow-sm",
            isMe ? "bg-gradient-to-br from-[#10B981] to-[#059669]" : "bg-gradient-to-br from-[#38BDF8] to-[#0284C7]"
          )}
        >
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span>{initialLetter}</span>
          )}
        </div>

        {/* Name Identification Text Container Block Grid */}
        <div className="flex flex-col">
          {isMe && (
            <span className="text-[10px] font-bold text-slate-400 tracking-wider leading-none uppercase mb-0.5">
              You
            </span>
          )}
          <span className={clsx("font-extrabold text-sm tracking-wide", isMe ? "text-white" : "text-slate-900")}>
            {user.name}
          </span>
        </div>
      </div>

      {/* Score performance metrics badge output display right block */}
      <div className="text-right">
        <span
          className={clsx(
            "font-black text-sm tracking-wide",
            isMe ? "text-[#1CC659]" : "text-[#1CC659]"
          )}
        >
          {value.toLocaleString()} {unit}
        </span>
      </div>

    </div>
  );
}