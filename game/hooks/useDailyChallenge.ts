"use client";

import { useState, useEffect } from 'react';
import { fetcher } from "@/lib/api";

export interface DailyChallengeStatus {
  has_onboarded: boolean;
  current_streak: number;
  current_island: number;
  played_today: boolean;
  lives_remaining: number;
}

export function useDailyChallenge() {
  const [status, setStatus] = useState<DailyChallengeStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch current game state from backend (Prepended /api route context)
  const refreshStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Added missing /api path wrapper prefix here
      const response = await fetcher<{ success?: boolean; status?: string; data: DailyChallengeStatus }>('/api/daily-challenge/status');
      
      if (response && (response.success || response.status === 'success')) {
        setStatus(response.data);
      } else {
        throw new Error("Failed to resolve payload structure");
      }
    } catch (err: any) {
      console.error("Hook profile sync failure:", err);
      setError(err.message || "An unknown error occurred loading status.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit onboarding categories (Prepended /api route context)
  const completeOnboarding = async (categoryIds: number[]) => {
    try {
      setLoading(true);
      
      // Added missing /api path wrapper prefix here
      const response = await fetcher<{ success?: boolean; status?: string }>('/api/daily-challenge/onboarding', {
        method: 'POST',
        body: JSON.stringify({ category_ids: categoryIds }),
      });
      
      if (response && (response.success || response.status === 'success')) {
        // Automatically fetch fresh status details to advance the viewport state
        await refreshStatus();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Onboarding submission failure:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return {
    status,
    loading,
    error,
    refreshStatus,
    completeOnboarding,
  };
}