"use client";

import { useState, useEffect, ReactNode } from "react";
import { StateView } from "./StateView";

export function NetworkGuard({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    // Initial check
    if (typeof window !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (isOffline) {
    return (
      <StateView
        type="no-network"
        fullScreen
        onRetry={() => {
          if (navigator.onLine) setIsOffline(false);
        }}
      />
    );
  }

  return <>{children}</>;
}