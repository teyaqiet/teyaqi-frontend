"use client";

import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";

import idleAnimation from "@/public/images/mascot/teyaqi_hello.json";
import rotateAnimation from "@/public/images/Loading/teyaqi_rotate.json";
import jumpAnimation from "@/public/images/Loading/teyaqi_smile.json";

interface WelcomeStepProps {
  onNext: () => void;
}

interface TelegramWebApp {
  initDataUnsafe?: {
    user?: {
      first_name?: string;
    };
  };
  HapticFeedback?: {
    impactOccurred: (
      style: "light" | "medium" | "heavy" | "rigid" | "soft"
    ) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const reactionPool = [
  rotateAnimation,
  jumpAnimation,
];

export default function WelcomeStep({
  onNext,
}: WelcomeStepProps) {
  const [currentAnimation, setCurrentAnimation] =
    useState(idleAnimation);

  const [isReacting, setIsReacting] =
    useState(false);

  const [tgName, setTgName] =
    useState("Challenger!");

  const lottieRef = useRef(null);

  useEffect(() => {
    const firstName =
      window.Telegram?.WebApp?.initDataUnsafe
        ?.user?.first_name;

    if (firstName) {
      setTgName(firstName);
    }
  }, []);

  const triggerHaptic = (
    style: "light" | "medium" = "light"
  ) => {
    const haptic =
      window.Telegram?.WebApp?.HapticFeedback;

    if (haptic) {
      haptic.impactOccurred(style);
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate(
        style === "medium" ? 40 : 30
      );
    }
  };

  const handleCharacterTouch = () => {
    if (isReacting) {
      return;
    }

    triggerHaptic("medium");

    const randomIndex = Math.floor(
      Math.random() * reactionPool.length
    );

    setIsReacting(true);

    setCurrentAnimation(
      reactionPool[randomIndex]
    );
  };

  const handleAnimationComplete = () => {
    if (!isReacting) {
      return;
    }

    setIsReacting(false);
    setCurrentAnimation(idleAnimation);
  };

  const handleNext = () => {
    triggerHaptic("light");
    onNext();
  };

  return (
    <div className="flex h-full w-full max-w-md mx-auto select-none flex-col items-center justify-between px-6 py-8 text-center animate-fade-in">
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <button
          type="button"
          onClick={handleCharacterTouch}
          className="relative mb-6 flex h-48 w-48 cursor-pointer items-center justify-center transition-transform duration-200 active:scale-95 focus:outline-none"
          aria-label="Tap character"
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={currentAnimation}
            loop={!isReacting}
            autoplay
            onComplete={handleAnimationComplete}
            className="pointer-events-none h-full w-full object-contain"
          />
        </button>

        <h1 className="mb-4 text-4xl font-black tracking-tight text-white">
          Selam 👋 {tgName}
        </h1>

        <p className="mb-2 max-w-xs text-lg font-bold text-white">
          Ready to test your brain?
        </p>

        <p className="max-w-sm text-base font-normal leading-relaxed text-slate-300">
          Play quick daily trivia designed to challenge your brain daily.
        </p>
      </div>

      <div className="w-full pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="w-full rounded-full bg-white px-6 py-4 text-xl font-black tracking-wide text-[#22c55e] shadow-xl transition-all hover:bg-slate-100 active:scale-[0.98]"
        >
          Let's Start
        </button>
      </div>
    </div>
  );
}