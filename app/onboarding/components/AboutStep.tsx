'use client';

import React from 'react';

interface AboutStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function AboutStep({ onNext, onBack }: AboutStepProps) {
  const highlights = [
    { icon: '🗺️', title: 'Daily Map Hub', desc: 'Sync live performance tracks and claim daily milestones.' },
    { icon: '⚡', title: 'Energy Pool', desc: 'Guard your core life vitals against target validation locks.' },
    { icon: '🏆', title: 'Global Sheets', desc: 'Compare real-time ranks across your friends network indexes.' },
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full w-full max-w-md mx-auto px-6 py-8 select-none animate-fade-in">
      <div className="w-full flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-black text-white text-center uppercase tracking-tight italic mb-2">
          Explore Teyaqi
        </h2>
        <p className="text-sm font-medium text-slate-400 text-center mb-8">
          A synchronized workspace configured to streamline knowledge mastery.
        </p>

        {/* Premium Gamified Info Rows */}
        <div className="space-y-4 w-full">
          {highlights.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border-2 border-b-4 border-slate-800/80 border-b-slate-950"
            >
              <div className="text-3xl p-2 bg-slate-950 rounded-xl border border-slate-800">{item.icon}</div>
              <div className="flex-1">
                <h4 className="font-black text-white text-base tracking-wide">{item.title}</h4>
                <p className="text-xs text-slate-400 font-medium leading-normal">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Block */}
      <div className="w-full space-y-3 mt-8">
        <button
          onClick={onNext}
          className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-4 px-6 rounded-2xl text-base uppercase tracking-widest border-b-4 border-slate-300 active:border-b-0 active:mt-[4px] transition-all"
        >
          Proceed to Characters
        </button>
        <button
          onClick={onBack}
          className="w-full bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 font-bold py-2 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}