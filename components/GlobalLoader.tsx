'use client';

import React from 'react';
import Image from 'next/image';

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b1426] select-none">
      
      {/* Static Mascot Container */}
      <div className="relative w-24 h-24 mb-4">
        <Image 
          src="/images/Loading/Teyaqi_loader.png"
          alt="Teyaqi"
          fill
          priority
          className="object-contain animate-pulse"
        />
      </div>

      {/* Simple Text */}
      <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
        Almost Done...
      </span>

    </div>
  );
}