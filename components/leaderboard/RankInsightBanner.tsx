"use client";

interface RankInsightBannerProps {
  currentRank: number;
  messageText: string;
}

export default function RankInsightBanner({ currentRank, messageText }: RankInsightBannerProps) {
  return (
    <div className="bg-[#49D4FF] text-[#090F1D] rounded-[24px] p-4 flex items-center gap-4 shadow-md w-full">
      {/* Absolute Rank Position Indicator */}
      <div className="w-11 h-11 rounded-full bg-[#090F1D] flex items-center justify-center font-black text-white text-base shrink-0 shadow-inner">
        #{currentRank > 0 ? currentRank : "1"}
      </div>
      
      {/* Contextual Insight Message */}
      <div className="font-black text-sm leading-snug tracking-tight">
        {messageText}
      </div>
    </div>
  );
}