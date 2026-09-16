"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  WifiOff,
  ShieldAlert,
  AlertTriangle,
  Inbox,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import Lottie from "lottie-react";
import mascotAnimation from "@/public/images/mascot/teyaqi_idel.json";
import { useRouter } from "next/navigation";

export type StateType = "no-network" | "auth-error" | "error" | "empty";

interface StateViewProps {
  type: StateType;
  title?: string;

  /** Custom description shown when showDetails is enabled */
  description?: string;

  /** Show the provided description instead of the safe default */
  showDetails?: boolean;

  /** Retry callback */
  onRetry?: () => void | Promise<void>;

  /**
   * Alternative action callback.
   * Kept for compatibility with existing StateView usages.
   */
  onAction?: () => void | Promise<void>;

  /**
   * Custom action button label.
   * Kept for compatibility with existing StateView usages.
   */
  actionLabel?: string;

  fullScreen?: boolean;

  actionLink?: {
    label: string;
    href: string;
  };

  /** Custom JSON Lottie animation */
  customLottie?: any;
}

const STATE_CONFIG: Record<
  StateType,
  {
    icon: typeof WifiOff;
    accentColor: string;
    cardBg: string;
    cardShadow: string;
    defaultTitleEn: string;
    defaultTitleAm: string;
    defaultDescEn: string;
    defaultDescAm: string;
    buttonLabelEn: string;
    buttonLabelAm: string;
  }
> = {
  "no-network": {
    icon: WifiOff,
    accentColor: "#f59e0b",
    cardBg: "bg-[#f59e0b]",
    cardShadow: "shadow-[0_8px_0_#d97706]",
    defaultTitleEn: "Connection Dropped",
    defaultTitleAm: "ኢንተርኔት ተቋርጧል",
    defaultDescEn:
      "You're offline or your connection is unstable. Check your network to keep playing.",
    defaultDescAm:
      "የኢንተርኔት ግንኙነትዎ ተቋርጧል። እባክዎን መስመርዎን ፈትሸው እንደገና ይሞክሩ።",
    buttonLabelEn: "Try Again",
    buttonLabelAm: "እንደገና ሞክር",
  },

  "auth-error": {
    icon: ShieldAlert,
    accentColor: "#ef4444",
    cardBg: "bg-[#ef4444]",
    cardShadow: "shadow-[0_8px_0_#dc2626]",
    defaultTitleEn: "Authentication Failed",
    defaultTitleAm: "ማረጋገጥ አልተቻለም",
    defaultDescEn:
      "Could not verify your Telegram account safely. Please restart the application.",
    defaultDescAm:
      "የቴሌግራም መለያዎን ማረጋገጥ አልተቻለም። እባክዎን መተግበሪያውን እንደገና ይክፈቱ።",
    buttonLabelEn: "Re-authenticate",
    buttonLabelAm: "እንደገና ግባ",
  },

  error: {
    icon: AlertTriangle,
    accentColor: "#1cd05d",
    cardBg: "bg-[#1cd05d]",
    cardShadow: "shadow-[0_8px_0_#15a34a]",
    defaultTitleEn: "Something Went Wrong",
    defaultTitleAm: "ችግር አጋጥሟል",
    defaultDescEn:
      "We hit an unexpected bump fetching your quiz data. Don't worry, your stats are safe.",
    defaultDescAm:
      "መረጃ ሲጫን ያልተጠበቀ ስህተት አጋጥሟል። እባክዎን እንደገና ይሞክሩ።",
    buttonLabelEn: "Reload Screen",
    buttonLabelAm: "እንደገና ጫን",
  },

  empty: {
    icon: Inbox,
    accentColor: "#3b82f6",
    cardBg: "bg-[#3b82f6]",
    cardShadow: "shadow-[0_8px_0_#2563eb]",
    defaultTitleEn: "Nothing Found",
    defaultTitleAm: "ምንም አልተገኘም",
    defaultDescEn:
      "No active challenges or topics available in this section right now.",
    defaultDescAm:
      "በዚህ ክፍል በአሁኑ ጊዜ ምንም ዓይነት ጥያቄዎች ወይም ውድድሮች አልተገኙም።",
    buttonLabelEn: "Refresh",
    buttonLabelAm: "አድስ",
  },
};

export function StateView({
  type,
  title,
  description,
  showDetails = false,
  onRetry,
  onAction,
  actionLabel,
  fullScreen = true,
  actionLink,
  customLottie,
}: StateViewProps) {
  const router = useRouter();

  const config = STATE_CONFIG[type];
  const Icon = config.icon;

  const [isRetrying, setIsRetrying] = useState(false);
  const [savedLang, setSavedLang] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSavedLang(localStorage.getItem("teyaqi_lang") || "en");
    }
  }, []);

  // Lock body scrolling while the fullscreen state is displayed.
  useEffect(() => {
    if (!fullScreen) return;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [fullScreen]);

  /**
   * Support both APIs:
   *
   * onRetry={...}
   *
   * and existing:
   *
   * onAction={...}
   */
  const retryHandler = onRetry || onAction;

  const handleRetry = async () => {
    if (!retryHandler) return;

    setIsRetrying(true);

    try {
      await retryHandler();
    } catch (error) {
      console.error("StateView action failed:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  /**
   * Safely close Telegram Mini App.
   * Falls back to browser navigation when Telegram is unavailable.
   */
  const handleBackOrClose = () => {
    if (
      typeof window !== "undefined" &&
      (window as any).Telegram?.WebApp?.close
    ) {
      (window as any).Telegram.WebApp.close();
    } else {
      router.back();
    }
  };

  const isAmharic = savedLang === "am";

  const displayTitle =
    title ||
    (isAmharic
      ? config.defaultTitleAm
      : config.defaultTitleEn);

  const displayDesc =
    showDetails && description
      ? description
      : isAmharic
        ? config.defaultDescAm
        : config.defaultDescEn;

  /**
   * Explicit actionLabel takes priority.
   * Otherwise use the default translated label.
   */
  const buttonText =
    actionLabel ||
    (isAmharic
      ? config.buttonLabelAm
      : config.buttonLabelEn);

  const content = (
    <div className="w-full max-w-[340px] flex flex-col items-center gap-5 my-auto">
      {/* MASCOT ANIMATION */}
      <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center relative">
        <Lottie
          animationData={customLottie || mascotAnimation}
          loop
          className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
        />
      </div>

      {/* 3D TACTILE STATUS CARD */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        className={`${config.cardBg} ${config.cardShadow} rounded-[2rem] p-5 text-center w-full flex-shrink-0 relative overflow-hidden`}
      >
        <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center mx-auto mb-3">
          <Icon className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-2xl font-black text-white uppercase mb-1 leading-tight tracking-tight">
          {displayTitle}
        </h2>

        <p className="text-white font-medium text-xs leading-relaxed opacity-95">
          {displayDesc}
        </p>
      </motion.div>

      {/* CONTROLS */}
      <div className="w-full flex flex-col items-center gap-3 flex-shrink-0 mt-2">
        {retryHandler && (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full py-3.5 bg-white rounded-2xl font-black text-lg text-[#0b1221] uppercase shadow-[0_6px_0_#cbd5e1] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${
                isRetrying ? "animate-spin" : ""
              }`}
            />

            <span>
              {isRetrying
                ? isAmharic
                  ? "እየሞከረ ነው..."
                  : "RETRYING..."
                : buttonText}
            </span>
          </button>
        )}

        {actionLink ? (
          <button
            type="button"
            onClick={() => router.push(actionLink.href)}
            className="text-white/50 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors pt-1 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>{actionLink.label}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBackOrClose}
            className="text-white/50 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors pt-1 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft size={14} />

            <span>
              {isAmharic ? "ዝጋ" : "CLOSE"}
            </span>
          </button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[500] bg-[#0b1221] w-full h-[100dvh] flex flex-col items-center justify-center px-6 py-8 select-none overflow-hidden touch-none font-sans">
        {content}
      </div>
    );
  }

  return content;
}