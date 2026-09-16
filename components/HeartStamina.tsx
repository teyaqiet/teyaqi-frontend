"use client";

import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface HeartContainerProps {
  currentLives: number;
  percentToNext: number;
}

export const HeartStamina = ({
  currentLives,
  percentToNext,
}: HeartContainerProps) => {
  const [prevLives, setPrevLives] = useState(currentLives);
  const [popIndex, setPopIndex] = useState<number | null>(null);

  useEffect(() => {
    if (currentLives > prevLives) {
      const audio = new Audio("/sounds/life.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});

      setPopIndex(currentLives);
      setTimeout(() => setPopIndex(null), 600);
    }
    setPrevLives(currentLives);
  }, [currentLives, prevLives]);

  return (
    <div className="flex gap-3 justify-center items-center w-fit mx-auto select-none">
      {[...Array(5)].map((_, i) => {
        const heartNumber = i + 1;
        const isFull = heartNumber <= currentLives;
        const isFilling = heartNumber === currentLives + 1 && currentLives < 5;
        const isPopping = popIndex === heartNumber;

        return (
          <div
            key={i}
            className={`relative w-10 h-10 transition-all duration-300 ${
              isPopping ? "scale-125" : "scale-100"
            }`}
          >
            {/* Base Outline */}
            <Heart className="absolute inset-0 w-full h-full text-slate-800 fill-slate-900/50" />

            {/* Full Heart */}
            {isFull && (
              <Heart className="absolute inset-0 w-full h-full text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            )}

            {/* Filling animation */}
            {isFilling && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(${100 - percentToNext}% 0 0 0)`,
                }}
              >
                <Heart className="w-10 h-10 text-red-500 fill-red-500 animate-pulse" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};