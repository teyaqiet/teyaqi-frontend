"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";

interface PodiumUser {
  id: string | number;
  name: string;
  avatar?: string;     
  avatar_url?: string; 
  qp?: number;
}

interface PodiumStageProps {
  topThreeUsers: PodiumUser[];
  currentUserId?: string | number;
  unit?: string;
}

function PodiumColumn({ 
  rank, 
  user, 
  isMe, 
  index,
  unit = "XP"
}: { 
  rank: 1 | 2 | 3; 
  user?: PodiumUser; 
  isMe: boolean;
  index: number;
  unit?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  if (!user) return <div className="w-[33.33%] opacity-0" />;

  const config = {
    1: {
      order: "order-2 z-30",
      height: 175, 
      topBg: "bg-[#52D270]",
      frontBg: "bg-gradient-to-b from-[#21A649] via-[#1E9A43] to-white",
      sideBg: "bg-[#167D34]",
      avatarBg: "bg-[#9B4DFF]",
      textColor: "text-white",
      hasCrown: true,
    },
    2: {
      order: "order-1 z-20",
      height: 135,
      topBg: "bg-[#3AC45D]",
      frontBg: "bg-gradient-to-b from-[#1E9E44] to-[#0F5C24]",
      sideBg: "bg-[#11702A]",
      avatarBg: "bg-[#2D8EFF]",
      textColor: "text-white",
      hasCrown: false,
    },
    3: {
      order: "order-3 z-10",
      height: 105,
      topBg: "bg-[#2CB04E]",
      frontBg: "bg-gradient-to-b from-[#19913E] to-[#0A4A1C]",
      sideBg: "bg-[#0E6625]",
      avatarBg: "bg-[#A2FF2C]",
      textColor: "text-[#090F1D]",
      hasCrown: false,
    },
  }[rank];

  const letterFallback = user.name ? user.name.charAt(0).toUpperCase() : "T";
  const resolvedAvatarUrl = user.avatar || user.avatar_url;
  const entryDelay = index * 0.15;

  return (
    <div className={clsx("flex flex-col items-center w-[33.33%] relative", config.order)}>
      
      {/* 1. FLOATING AVATAR & METADATA */}
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: entryDelay + 0.2 }}
        className="relative flex flex-col items-center w-full z-40 mb-2"
      >
        {config.hasCrown && (
          <div className="absolute -top-[20px] z-50 drop-shadow-md animate-bounce-slow">
            <div className="w-7 h-7 bg-[#FFD02B] clip-hexagon flex items-center justify-center border border-amber-300">
              <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M2 22l2-14 5 4 3-8 3 8 5-4 2 14z" />
              </svg>
            </div>
          </div>
        )}

        <div className={clsx(
          "w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-lg shrink-0 border-2 transition-transform duration-300 hover:scale-110",
          isMe ? "border-amber-400 scale-110 shadow-amber-500/20" : "border-white/10",
          config.avatarBg
        )}>
          {resolvedAvatarUrl && !imgFailed ? (
            <img 
              src={resolvedAvatarUrl} 
              alt={user.name} 
              className="w-full h-full object-cover relative z-10" 
              referrerPolicy="no-referrer" // Helps bypass strict asset hotlink blocks
              onError={() => setImgFailed(true)}
            />
          ) : null}
          
          {/* Permanent Background Fallback Stack Layer */}
          <span className={clsx("absolute text-2xl font-black tracking-tight select-none z-0", config.textColor)}>
            {letterFallback}
          </span>
        </div>

        <p className="font-black text-white text-xs text-center w-full mt-1.5 truncate max-w-[90px] drop-shadow-sm">
          {user.name}
        </p>
      </motion.div>

      {/* 2. THE 3D PILLAR */}
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: config.height }}
        transition={{ type: "spring", stiffness: 80, damping: 15, delay: entryDelay }}
        className="w-full flex flex-col relative mt-auto origin-bottom"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: entryDelay + 0.4, type: "spring" }}
          className="absolute -top-7 left-1/2 -translate-x-1/2 z-40 bg-[#1CC659] text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md border border-white/20 whitespace-nowrap"
        >
          {(user.qp ?? 0).toLocaleString()} {unit}
        </motion.div>

        <div className="w-full h-4 relative shrink-0 z-30 overflow-hidden">
          <div className={clsx("absolute inset-0 h-6 -skew-x-[24deg] origin-top scale-x-[1.15] rounded-t-sm", config.topBg)} />
        </div>

        <div className="flex flex-1 w-full -mt-0.5 relative z-10 overflow-hidden">
          <div className={clsx("absolute inset-0 z-0", config.frontBg)} />
          <div className="flex-1 flex items-start justify-center relative z-10">
            <motion.span 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.95, y: 0 }}
              transition={{ delay: entryDelay + 0.3 }}
              className={clsx(
                "font-black text-6xl tracking-tighter select-none mt-2",
                rank === 1 ? "text-[#1E9A43] mix-blend-difference" : "text-white/90"
              )}
            >
              {rank}
            </motion.span>
          </div>
          
          <div className="w-3 h-full relative overflow-hidden shrink-0 z-20">
            <div className={clsx("absolute inset-0 h-[200%] transform skew-y-[24deg] origin-top-left scale-y-[1.2]", config.sideBg)} />
          </div>
        </div>
      </motion.div>

    </div>
  );
}

export default function PodiumStage({ topThreeUsers, currentUserId, unit }: PodiumStageProps) {
  const animationOrder = [
    { rank: 2, user: topThreeUsers[1], index: 0 },
    { rank: 3, user: topThreeUsers[2], index: 1 },
    { rank: 1, user: topThreeUsers[0], index: 2 },
  ];

  return (
    <div className="w-full px-4 pt-6 pb-0 flex justify-center items-end h-[290px] relative overflow-visible bg-transparent mx-auto select-none max-w-sm -space-x-1">
      {animationOrder.map((col) => (
        <PodiumColumn
          key={col.rank}
          rank={col.rank as 1 | 2 | 3}
          user={col.user}
          isMe={String(col.user?.id) === String(currentUserId)}
          index={col.index}
          unit={unit}
        />
      ))}

      <style jsx global>{`
        .clip-hexagon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}