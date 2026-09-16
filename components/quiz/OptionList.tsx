"use client";

import { useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export default function OptionList({ question, isAnswered, onSelect, isSubmitting, selectedOption }: any) {
  const { lang } = useLanguage();
  const labels = ["A", "B", "C", "D"];

  const normalizedOptions = useMemo(() => {
    if (!question?.options) return [];

    // Case 1: Already an array
    if (Array.isArray(question.options)) return question.options;

    // Case 2: Object format (e.g., { "a": {...}, "b": {...} })
    if (typeof question.options === 'object') {
      return Object.entries(question.options).map(([key, value]: [string, any]) => ({
        ...(typeof value === 'object' ? value : { text: value }),
        key: key,
      }));
    }

    return [];
  }, [question?.options]);

  if (normalizedOptions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 w-full shrink-0">
      {normalizedOptions.map((option: any, index: number) => {
        // IMPROVED LABEL RESOLVER: Checks every possible field location
        const displayLabel = 
          option[lang] || 
          option.text || 
          option.option_text || 
          option.title || 
          (typeof option === 'string' ? option : JSON.stringify(option));

        const optionKey = option.key || labels[index].toLowerCase();
        const isUserSelection = selectedOption === optionKey;
        
        // Correct identification: Check boolean flags or matching keys
        const isCorrect = option.is_correct === true || 
                          option.correct === true || 
                          (question.correct_answer === optionKey);

        return (
          <button
            key={index}
            disabled={isAnswered || isSubmitting}
            onClick={() => onSelect(isCorrect, optionKey)}
            className={cn(
              "w-full px-5 py-4 rounded-2xl border-2 font-black uppercase text-left transition-all flex items-center gap-4 min-h-[60px]",
              "bg-[#0a0f2d] border-white/10 text-white/90 hover:border-white/20",
              isUserSelection && !isAnswered && "border-blue-500 bg-blue-500/10 text-blue-400",
              isAnswered && isCorrect && "bg-emerald-500 border-emerald-400 text-slate-950",
              isAnswered && !isCorrect && isUserSelection && "bg-rose-600 border-rose-500 text-white",
              isAnswered && !isCorrect && !isUserSelection && "opacity-30 border-transparent bg-white/5"
            )}
          >
            <span className={cn(
              "w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black shrink-0 border-2",
              isAnswered && isCorrect ? "bg-slate-950/20 border-black/20" : "bg-white/5 border-white/10"
            )}>
              {labels[index]}
            </span>
            <span className="text-[15px] font-bold tracking-wide leading-snug">
              {displayLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}