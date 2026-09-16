"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Locale } from "@/lib/i18n";

type LanguageContextType = {
  lang: Locale;
  setLang: (lang: Locale) => void;
  t: typeof translations.en;
  mounted: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Check URL for bot-provided language (?lang=am or ?lang=en)
    const urlParams = new URLSearchParams(window.location.search);
    const botLang = urlParams.get('lang') as Locale;

    // 2. Check localStorage for previously saved preference
    const saved = localStorage.getItem("teyaqi_lang") as Locale;

    let finalLang: Locale = "en"; // Default fallback

    // --- PRIORITY LOGIC ---
    // First Priority: Language explicitly passed in the URL (from Telegram Bot)
    if (botLang && translations[botLang]) {
      finalLang = botLang;
      localStorage.setItem("teyaqi_lang", botLang);
      
      // Clean up the URL: Remove ?lang= from the browser bar without refreshing
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    } 
    // Second Priority: Previously saved language in this browser
    else if (saved && translations[saved]) {
      finalLang = saved;
    }

    setLangState(finalLang);
    setMounted(true);
  }, []);

  /**
   * Manually switch language (e.g., from the Settings page)
   */
  const setLang = (newLang: Locale) => {
    if (translations[newLang]) {
      setLangState(newLang);
      localStorage.setItem("teyaqi_lang", newLang);
    }
  };

  // Select the correct translation object or fallback to English
  const t = translations[lang] || translations.en;

  // Debugging log for development
  if (mounted && process.env.NODE_ENV === "development") {
    console.log(`[Language] System Sync: ${lang.toUpperCase()}`);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};