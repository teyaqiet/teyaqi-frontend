// C:\Users\msi gp 76\teyaqi-app\game\hooks\useAudio.ts

import { useCallback } from 'react';
import { audioService, SoundEffect } from '../services/audioService';
import { useTelegram } from "@/game/hooks/useTelegram";

export function useAudio() {
  const { triggerHaptic: nativeTelegramHaptic } = useTelegram();

  /**
   * Triggers an explicit sound effect playback channel instantly.
   * (Note: audioService self-corrects via sound_enabled in localStorage)
   */
  const playSound = useCallback((effect: SoundEffect, volume: number = 1.0) => {
    audioService.play(effect, volume);
  }, []);

  /**
   * Safe termination for active loop tracks or warning countdown states.
   */
  const stopSound = useCallback((effect: SoundEffect) => {
    audioService.stop(effect);
  }, []);

  /**
   * Smart, settings-aware haptics engine channel wrapper.
   * Checks the local storage profile state before touching the hardware bridge.
   */
  const triggerHaptic = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning') => {
    if (typeof window !== "undefined") {
      const hapticsEnabled = localStorage.getItem("vibe_enabled") !== "false";
      if (!hapticsEnabled) return; // Silent discard if user toggled off vibration
    }
    nativeTelegramHaptic(style);
  }, [nativeTelegramHaptic]);

  /**
   * Initializes the shared low-latency audio hardware subsystem context.
   */
  const unlockAudio = useCallback(async () => {
    await audioService.init();
  }, []);

  return {
    playSound,
    stopSound,
    triggerHaptic, // 💡 Exposed as an environment-aware pass-through
    unlockAudio,
  };
}