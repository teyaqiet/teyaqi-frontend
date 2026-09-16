// C:\Users\msi gp 76\teyaqi-app\game\hooks\useStreakManager.ts
import { useState, useCallback } from "react";
import { gameService } from "@/game/services/gameService";

export type StreakStatus = "healthy" | "warning_freeze_available" | "reset" | "dead" | "frozen";

export function useStreakManager(dispatch: React.Dispatch<any>) {
  const [streakStatus, setStreakStatus] = useState<StreakStatus>("healthy");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const evaluateStreakStatus = useCallback((status: string) => {
    console.log("🔍 [StreakManager] Received raw status from page:", status);
    
    const standardizedStatus = status as StreakStatus;
    setStreakStatus(standardizedStatus);

    // Added "frozen" defensively in case your backend uses it instead of warning_freeze_available
    const shouldOpen = [
      "warning_freeze_available", 
      "reset", 
      "dead", 
      "frozen"
    ].includes(standardizedStatus);

    console.log(`⚡ [StreakManager] Condition check completed. Should open modal? ${shouldOpen}`);

    if (shouldOpen) {
      setIsAlertOpen(true);
    }
  }, []);

  const activateFreezeShield = async () => {
    setIsLoading(true);
    try {
      const response = await gameService.useFreezeShield();
      if (response.status === "success") {
        setStreakStatus("healthy");
        setIsAlertOpen(false);
        if (typeof dispatch === "function") {
          dispatch({
            type: "UPDATE_STREAK_METRICS",
            payload: {
              streak: response.data.current_streak,
              freezes_left: response.data.freezes_left,
            },
          });
        }
      }
    } catch (error) {
      console.error("❌ Failed to manually consume freeze shield:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    streakStatus,
    isAlertOpen,
    setIsAlertOpen,
    isLoading,
    checkStreakStatus: evaluateStreakStatus,
    activateFreezeShield,
  };
}