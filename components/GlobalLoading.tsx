'use client';

import React from 'react';
import Lottie from 'lottie-react';
// Statically importing the JSON forces Next.js to bundle it directly so it's ready instantly
import mascotAnimation from '@/public/images/mascot/teyaqi_hello.json';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0b1426] text-white select-none">
      
      {/* 1. Animated Mascot Container */}
      <div className="relative mb-8">
        {/* Expanded radial ambient glow drop shadow */}
        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-110 opacity-60 animate-pulse" />
        
        {/* Scaled up box frame */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <Lottie
            animationData={mascotAnimation}
            loop={true}
            autoplay={true}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* 2. Text Branding Block */}
      <h3 className="text-2xl font-black tracking-wider uppercase text-white italic">
        TEYAQI
      </h3>
      <p className="mt-1.5 text-[11px] text-emerald-400 font-black tracking-widest uppercase mb-8 opacity-90">
        Loading...
      </p>

      {/* 3. Modern Premium Linear Dot Progress Bar */}
      <div className="flex items-center gap-1.5 justify-center h-2 w-16">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-[pulse_1s_infinite_0ms]" />
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_1s_infinite_200ms]" />
        <div className="w-2 h-2 rounded-full bg-emerald-600 animate-[pulse_1s_infinite_400ms]" />
      </div>

    </div>
  );
}