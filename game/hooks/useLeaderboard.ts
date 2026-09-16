"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { fetcher } from "@/lib/api";

export function useLeaderboard() {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<any>(null);

  // Prevent duplicate requests from this hook instance.
  const requestPromiseRef =
    useRef<Promise<void> | null>(null);

  // Track component lifecycle correctly.
  const isMountedRef =
    useRef(true);

  const load =
    useCallback(
      async (
        silent = false
      ) => {
        // If this hook is already loading,
        // reuse the existing request.
        if (
          requestPromiseRef.current
        ) {
          return requestPromiseRef.current;
        }

        const requestPromise =
          (async () => {
            try {
              if (!silent) {
                setLoading(true);
              }

              setError(null);

              console.log(
                "[Leaderboard] Fetching leaderboard..."
              );

              const res =
                await fetcher<any>(
                  "/api/leaderboard"
                );

              if (
                !isMountedRef.current
              ) {
                return;
              }

              const payload =
                res?.data ?? res;

              setData({
                all_time: {
                  leaders:
                    payload?.all_time
                      ?.leaders ?? [],

                  top_three:
                    payload?.all_time
                      ?.top_three ?? [],

                  current_user:
                    payload?.all_time
                      ?.current_user ?? null,

                  total_count:
                    payload?.all_time
                      ?.total_count ?? 0,
                },

                weekly: {
                  leaders:
                    payload?.weekly
                      ?.leaders ?? [],

                  top_three:
                    payload?.weekly
                      ?.top_three ?? [],

                  current_user:
                    payload?.weekly
                      ?.current_user ?? null,

                  total_count:
                    payload?.weekly
                      ?.total_count ?? 0,
                },

                streak: {
                  leaders:
                    payload?.streak
                      ?.leaders ?? [],

                  top_three:
                    payload?.streak
                      ?.top_three ?? [],

                  current_user:
                    payload?.streak
                      ?.current_user ?? null,

                  total_count:
                    payload?.streak
                      ?.total_count ?? 0,
                },
              });
            } catch (
              error
            ) {
              if (
                isMountedRef.current
              ) {
                setError(error);
              }

              console.error(
                "[Leaderboard] Fetch Error:",
                error
              );
            } finally {
              if (
                isMountedRef.current
              ) {
                setLoading(false);
              }
            }
          })();

        requestPromiseRef.current =
          requestPromise;

        try {
          await requestPromise;
        } finally {
          requestPromiseRef.current =
            null;
        }
      },
      []
    );

  useEffect(() => {
    isMountedRef.current =
      true;

    void load();

    const handleScoreUpdate =
      () => {
        void load(true);
      };

    const handleFocus =
      () => {
        void load(true);
      };

    window.addEventListener(
      "scoreUpdated",
      handleScoreUpdate
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      isMountedRef.current =
        false;

      window.removeEventListener(
        "scoreUpdated",
        handleScoreUpdate
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [load]);

  return {
    data,
    loading,
    error,

    refresh: (
      silent = false
    ) => load(silent),
  };
}