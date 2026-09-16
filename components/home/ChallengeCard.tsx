"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, HelpCircle } from "lucide-react";
import Link from "next/link";

interface Challenge {
  id?: string | number;
  title?: string;
  reward_xp?: number;
  difficulty?: string;
  question_count?: number; 
  thumbnail_url?: string | null;
}

export const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  if (!challenge) return null;

  const challengeId = challenge.id ?? "all";
  const rawTitle = challenge.title ?? "History";
  const rewardXp = challenge.reward_xp ?? 10;
  const difficulty = (challenge.difficulty ?? "medium").toUpperCase();
  const finalQuestionCount = challenge.question_count ?? 5;

  return (
    <Link href={`/quiz?challengeId=${challengeId}`} className="block no-underline w-full">
      <motion.div 
        whileTap={{ scale: 0.98 }}
        className="bg-[#121a27] border border-slate-800/80 rounded-2xl p-4 w-full flex items-center justify-between shadow-lg cursor-pointer hover:border-slate-700/80 transition-all min-h-[96px]"
      >
        <div className="flex items-center gap-4">
          {/* Larger Welcoming Icon / Image Container */}
          <div className="w-16 h-16 rounded-2xl bg-[#1b2638] overflow-hidden flex items-center justify-center shrink-0 border border-slate-700/60 shadow-inner relative">
            {challenge.thumbnail_url ? (
              <img 
                src={challenge.thumbnail_url} 
                alt={rawTitle} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <HelpCircle className="w-8 h-8 text-slate-400" />
            )}
          </div>

          {/* Card Body Details */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-base text-white leading-tight">
              {rawTitle}
            </h4>
            
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>{finalQuestionCount} Questions</span>
              <span>•</span>
              <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-bold text-[11px]">
                {difficulty}
              </span>
            </div>

            <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs pt-0.5">
              
              <span>+{rewardXp} XP Reward</span>
            </div>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#1b2638] flex items-center justify-center shrink-0 border border-slate-800">
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </motion.div>
    </Link>
  );
};