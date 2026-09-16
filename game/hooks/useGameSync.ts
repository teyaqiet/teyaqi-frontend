/**
 * @teyaqi-feat: Teyaqi-Server-Sync-Layer
 * @teyaqi-info:
 * Synchronizes final challenge telemetry payloads back to Laravel.
 * Handles separate routing logic for Daily Sessions and Custom Challenges.
 */

"use client";

import { useEffect, useRef } from "react";
import {
  gameService,
  calculateScore,
} from "@/game/services/gameService";
import { GameState } from "../core/gameTypes";

export function useGameSync(
  state: GameState,
  dispatch: React.Dispatch<any>
) {
  // ============================================================
  // SYNC LOCKS
  // ============================================================

  const lastSyncedIdRef = useRef<string | number | null>(null);
  const isSyncingRef = useRef<boolean>(false);

  // Keep latest state available inside the effect.
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ============================================================
  // FINAL GAME SYNC
  // ============================================================

  useEffect(() => {
    const currentState = stateRef.current;

    // ----------------------------------------------------------
    // RESET SYNC LOCK WHEN GAME RETURNS TO IDLE
    // ----------------------------------------------------------

    if (state.status === "idle") {
      lastSyncedIdRef.current = null;
      isSyncingRef.current = false;
      return;
    }

    // ----------------------------------------------------------
    // DETERMINE WHETHER GAME HAS ENDED
    // ----------------------------------------------------------

    const isGameOver =
      state.status === "completed" ||
      state.status === "gameover" ||
      state.status === "failed";

    if (!isGameOver) {
      return;
    }

    // ----------------------------------------------------------
    // DETERMINE GAME TYPE
    // ----------------------------------------------------------
    //
    // Daily Quiz:
    //   state.sessionId = GameSession ID
    //
    // Custom Challenge:
    //   state.attemptId = ChallengeAttempt ID
    //
    // These are different database records and must not be mixed.
    // ----------------------------------------------------------

    const isDailyQuizRun =
      !!currentState.sessionId ||
      currentState.attemptId === "daily_session";

    // ============================================================
    // TRACK A — DAILY QUIZ
    // ============================================================

    if (isDailyQuizRun) {
      const dailySessionId = currentState.sessionId;

      // ----------------------------------------------------------
      // VALIDATE SESSION ID
      // ----------------------------------------------------------

      const numericSessionId = Number(dailySessionId);

      if (
        !Number.isInteger(numericSessionId) ||
        numericSessionId <= 0
      ) {
        console.error(
          "❌ Sync Aborted: Invalid Daily Session ID:",
          dailySessionId
        );

        isSyncingRef.current = false;
        return;
      }

      // ----------------------------------------------------------
      // PREVENT DUPLICATE SYNC
      // ----------------------------------------------------------

      if (
        lastSyncedIdRef.current === numericSessionId ||
        isSyncingRef.current
      ) {
        return;
      }

      // ----------------------------------------------------------
      // ENGAGE MUTEX
      // ----------------------------------------------------------

      lastSyncedIdRef.current = numericSessionId;
      isSyncingRef.current = true;

      console.log(
        "🏁 Finalizing Daily Quiz session:",
        numericSessionId
      );

      // ----------------------------------------------------------
      // IMPORTANT:
      //
      // /quiz/finish is SERVER-AUTHORITATIVE.
      //
      // DO NOT send:
      // - lives
      // - XP
      // - coins
      // - streak
      // - answers
      //
      // Laravel rebuilds the session from quiz_responses.
      // ----------------------------------------------------------

      gameService
        .finishGame(numericSessionId)

        .then((response) => {
          console.log(
            "✅ Daily Quiz finish success:",
            response
          );

          // ------------------------------------------------------
          // RESPONSE COMES FROM gameService.finishGame()
          //
          // gameService returns response.data.
          //
          // Therefore these fields are directly on response:
          // response.total_xp
          // response.user_sr
          // response.streak
          // ------------------------------------------------------

          const updatedStreak =
            Number(
              response?.streak ??
              response?.current_streak ??
              currentState.streak ??
              0
            );

          const updatedXp =
            Number(
              response?.total_xp ??
              currentState.xp ??
              0
            );

          const updatedSr =
            Number(
              response?.user_sr ??
              currentState.sr ??
              50
            );

          // ------------------------------------------------------
          // SYNC SERVER VALUES INTO CLIENT STATE
          // ------------------------------------------------------

          dispatch({
            type: "SYNC_SERVER_DATA",

            payload: {
              xp: updatedXp,

              sr: updatedSr,

              streak: updatedStreak,

              last_played:
                new Date().toISOString(),

              // The current backend response does not return
              // an advanced_streak boolean, so don't trigger
              // the animation based on an unavailable field.
              triggerIslandAnimation: false,
            },
          });
        })

        .catch((error) => {
          console.error(
            "❌ Failed to synchronize final daily game metrics:",
            error
          );

          // Allow retry if server rejected the request.
          if (
            error?.response?.status >= 400
          ) {
            lastSyncedIdRef.current = null;
          }
        })

        .finally(() => {
          isSyncingRef.current = false;
        });

      return;
    }

    // ============================================================
    // TRACK B — CUSTOM CHALLENGE
    // ============================================================

    const challengeAttemptId =
      currentState.attemptId;

    // ----------------------------------------------------------
    // VALIDATE CHALLENGE ATTEMPT ID
    // ----------------------------------------------------------

    if (
      challengeAttemptId === null ||
      challengeAttemptId === undefined ||
      challengeAttemptId === ""
    ) {
      console.error(
        "❌ Sync Aborted: Missing Challenge Attempt ID:",
        challengeAttemptId
      );

      isSyncingRef.current = false;
      return;
    }

    // ----------------------------------------------------------
    // PREVENT DUPLICATE CHALLENGE SYNC
    // ----------------------------------------------------------

    if (
      lastSyncedIdRef.current === challengeAttemptId ||
      isSyncingRef.current
    ) {
      return;
    }

    // ----------------------------------------------------------
    // ENGAGE MUTEX
    // ----------------------------------------------------------

    lastSyncedIdRef.current = challengeAttemptId;
    isSyncingRef.current = true;

    // ============================================================
    // BUILD CHALLENGE TELEMETRY
    // ============================================================

    let totalXp = 0;
    let maxStreak = 0;
    let runningStreak = 0;

    const rawAnswers =
      currentState.savedResponses || [];

    const mappedResponses = rawAnswers
      .map((resp: any) => {
        const selectedOption =
          resp.selected_option ??
          resp.selectedOption ??
          resp.selected ??
          resp.answer ??
          null;

        if (!selectedOption) {
          return null;
        }

        const isCorrect =
          !!(
            resp.is_correct ??
            resp.isCorrect
          );

        // ------------------------------------------------------
        // STREAK CALCULATION
        // ------------------------------------------------------

        if (isCorrect) {
          runningStreak++;

          if (
            runningStreak > maxStreak
          ) {
            maxStreak =
              runningStreak;
          }

          totalXp += calculateScore(
            resp.remaining_time ??
              resp.remainingTimeSeconds ??
              0,
            runningStreak
          );
        } else {
          runningStreak = 0;
        }

        return {
          question_id: Number(
            resp.question_id ??
            resp.questionId ??
            resp.id
          ),

          selected_option:
            String(
              selectedOption
            ).toLowerCase(),

          remaining_time:
            Number(
              resp.remaining_time ??
              resp.remainingTimeSeconds ??
              0
            ),

          is_correct: isCorrect,
        };
      })
      .filter(Boolean);

    // ----------------------------------------------------------
    // CHALLENGE REWARDS
    // ----------------------------------------------------------

    const totalCoins =
      Math.floor(totalXp * 0.2);

    // ----------------------------------------------------------
    // TIME SPENT
    // ----------------------------------------------------------

    const computedTimeSpent =
      currentState.timeSpent ||
      Math.max(
        0,
        (
          currentState.timeLimit *
          currentState.questions.length
        ) -
          currentState.timeLeft
      );

    // ----------------------------------------------------------
    // SERVER TELEMETRY PAYLOAD
    // ----------------------------------------------------------

    const submitPayload = {
      time_spent:
        Number(computedTimeSpent) || 0,

      max_streak:
        maxStreak ||
        currentState.maxStreak ||
        0,

      remaining_time_seconds:
        currentState.timeLeft ?? 0,

      total_xp_earned:
        totalXp,

      total_coins_earned:
        totalCoins,

      responses:
        mappedResponses,
    };

    console.log(
      "🏁 Finalizing Custom Challenge:",
      challengeAttemptId
    );

    // ============================================================
    // SEND CUSTOM CHALLENGE
    // ============================================================

    gameService
      .submitChallengeAttempt(
        challengeAttemptId,
        submitPayload
      )

      .then((response) => {
        console.log(
          "✅ Custom Challenge sync success:",
          response
        );

        const serverAttempt =
          response?.results ||
          response?.attempt ||
          response;

        dispatch({
          type: "SYNC_SERVER_DATA",

          payload: {
            xp: Number(
              serverAttempt?.score ??
              totalXp
            ),

            sr:
              currentState.sr,

            streak:
              Number(
                serverAttempt?.max_streak ??
                maxStreak ??
                currentState.maxStreak ??
                0
              ),

            last_played:
              new Date().toISOString(),
          },
        });
      })

      .catch((error) => {
        console.error(
          "❌ Failed to sync custom challenge telemetry:",
          error
        );

        // Don't retry an already-submitted attempt.
        const alreadySubmitted =
          error?.message?.includes(
            "already submitted"
          );

        if (
          error?.response?.status !== 422 &&
          !alreadySubmitted
        ) {
          lastSyncedIdRef.current = null;
        }
      })

      .finally(() => {
        isSyncingRef.current = false;
      });

  }, [
    state.status,
    state.attemptId,
    state.sessionId,
    dispatch,
  ]);

  // ============================================================
  // PUBLIC SYNC STATE
  // ============================================================

  return {
    hasSynced:
      lastSyncedIdRef.current !== null,
  };
}