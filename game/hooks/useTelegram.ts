/**
 * @teyaqi-feat: Telegram-Core-Integration
 * @teyaqi-info: The primary interface for the Telegram WebApp API. 
 * This hook initializes the Mini App environment, handles user data extraction 
 * (initData), and provides native UI controls like the BackButton.
 * @teyaqi-fix: webApp.expand() is called immediately to ensure the game 
 * occupies the full screen height on mobile devices, preventing 'viewport 
 * jumping' when the keyboard or bottom sheets appear.
 * @teyaqi-dep: useQuizEffects (Haptics), Layout (initData)
 */

"use client";

import { useEffect, useState, useCallback } from "react";

export function useTelegram() {
  const [tg, setTg] = useState<any>(null);

  useEffect(() => {
    // @teyaqi-info: Accessing the global Telegram object injected by the 
    // <Script src="https://telegram.org/js/telegram-web-app.js" />
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand(); // Force full-screen mode for the best trivia experience
      setTg(webApp);
    }
  }, []);

  /**
   * @teyaqi-feat: Native-Navigation
   * @teyaqi-info: Binds custom React navigation logic to the native 
   * Telegram Back Button.
   */
  const showBackButton = useCallback((onClick: () => void) => {
    if (!tg) return;
    tg.BackButton.show();
    tg.BackButton.onClick(onClick);
  }, [tg]);

  const hideBackButton = useCallback(() => {
    if (!tg) return;
    tg.BackButton.hide();
  }, [tg]);

  /**
   * @teyaqi-feat: Teyaqi-Haptic-Feedback
   * @teyaqi-info: Maps game events to native vibration motors. 
   * 'notificationOccurred' is used for game logic (Win/Loss), 
   * while 'impactOccurred' is used for UI weight (button presses).
   */
  const triggerHaptic = (type: "success" | "warning" | "error" | "light" | "medium" | "heavy") => {
    if (!tg) return;
    if (["success", "warning", "error"].includes(type)) {
      tg.HapticFeedback.notificationOccurred(type);
    } else {
      tg.HapticFeedback.impactOccurred(type);
    }
  };

  return {
    tg,
    /**
     * @teyaqi-info: The user object contains the Telegram ID, username, 
     * and language_code. This is the source of truth for the Laravel /auth/telegram endpoint.
     */
    user: tg?.initDataUnsafe?.user,
    triggerHaptic,
    showBackButton,
    hideBackButton,
    closeApp: () => tg?.close(),
  };
}