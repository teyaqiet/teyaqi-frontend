/**
 * @teyaqi-feat: Teyaqi-Frontend-Engine
 * @teyaqi-info: Central hook orchestrator. Handles timers, answer flow,
 * life deduction, streak tracking, and final sync pipelines.
 */

"use client";

import { useReducer, useCallback, useRef, useEffect, useState } from "react";
import { gameReducer, initialState } from "../core/engine";
import { gameService } from "../services/gameService";
import { calculateScore } from "../systems/scoringSystem";
import { getRank } from "../systems/rankSystem";
import { useLanguage } from "@/context/LanguageContext";

export const useGame = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const stateRef = useRef(state);

  const { lang } = useLanguage();

  // UI STATES
  const [feedback, setFeedback] = useState<{
    text: string;
    isCorrect: boolean;
    qIndex: number;
  } | null>(null);

  const [rankNotice, setRankNotice] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [bonusNotice, setBonusNotice] = useState<{
    amount: number;
    streak: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocked = useRef(false);
  const prevRankLabelRef = useRef("");

  // Keep latest reducer state available everywhere
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * ==========================================
   * CLOCK LOOP ENGINE
   * ==========================================
   */
  useEffect(() => {
    if (state.status !== "playing" || state.isCorrect !== null) return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK_CLOCK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, state.isCorrect]);

  /**
   * ==========================================
   * RANK OBSERVER ENGINE
   * ==========================================
   */
  useEffect(() => {
    if (
      state.status !== "playing" &&
      state.status !== "completed" &&
      state.status !== "failed" &&
      state.status !== "gameover"
    ) {
      return;
    }

    const currentRank = getRank(state.sr);

    if (!prevRankLabelRef.current) {
      prevRankLabelRef.current = currentRank.label;
      return;
    }

    if (currentRank.label !== prevRankLabelRef.current) {
      const rankText = lang === "am" ? "ደረጃ" : "Rank";

      setRankNotice(`${currentRank.label} ${rankText}!`);
      prevRankLabelRef.current = currentRank.label;

      setTimeout(() => {
        setRankNotice(null);
      }, 3000);
    }
  }, [state.sr, state.status, lang]);

  /**
   * ANSWER SUBMISSION
   */
  const handleSubmission = useCallback(
    async (
      isCorrect: boolean,
      optionKey: string,
      customText: string
    ) => {
      const s = stateRef.current;

      if (isLocked.current) return;
      if (s.isCorrect !== null) return;

      isLocked.current = true;
      const qIndex = s.currentQuestionIndex;
      const currentQuestion = s.questions[qIndex];
      const timeSpent = s.timeLimit - s.timeLeft;

      setSelectedOption(optionKey);

      setFeedback({
        text: customText,
        isCorrect,
        qIndex,
      });

      const challengeBaseXp = s.rewardXp || 10;
      const currentQuestionTimeLimit = s.timeLimit || 15;
      const nextStreakValue = s.streak + 1;

      const exactXpEarned = isCorrect 
        ? calculateScore({
            baseXp: challengeBaseXp,
            timeLeft: s.timeLeft,
            timeLimit: currentQuestionTimeLimit,
            streak: nextStreakValue
          })
        : 0;

      if (isCorrect && nextStreakValue >= 2) {
        let displayBonusAmount = 0;
        if (timeSpent <= 3) displayBonusAmount += 5;
        if (nextStreakValue === 3) displayBonusAmount += 30;
        else if (nextStreakValue > 3) displayBonusAmount += 10;

        if (displayBonusAmount > 0) {
          setBonusNotice({ amount: displayBonusAmount, streak: nextStreakValue });
        }
      }

      dispatch({
        type: "SUBMIT_ANSWER",
        payload: {
          selectedOption: optionKey,
          isCorrect,
          timeMs: timeSpent,
          remainingTimeSeconds: s.timeLeft,
          predictedXP: exactXpEarned,
        },
      });

      if (s.sessionId && !s.attemptId) {
        gameService.submitAnswer(currentQuestion.id, optionKey, s.sessionId, timeSpent)
          .catch((err) => console.error("❌ Daily Quiz submitAnswer failed:", err));
      }

      const delay = isCorrect ? 1500 : 2200;
      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
        setBonusNotice(null);
        dispatch({ type: "NEXT_QUESTION" });
        setTimeout(() => {
          const nextState = stateRef.current;
          if (nextState.status === "playing" && nextState.lives > 0) {
            isLocked.current = false;
          }
        }, 100);
      }, delay);
    },
    []
  );

  const startChallengeGame = useCallback((
  questions: any[],
  attemptId: number | string | null,
  timeMode: "per_session" | "per_question",
  timeLimit: number,
  sr: number,
  lives: number,
  rewardXp: number,
  rewardCoins: number,
  sessionId: string | number | null = null // Ensure this is here
) => {
  dispatch({
    type: "START_GAME",
    payload: {
      questions,
      lives,
      sr,
      timeMode,
      timeLimit,
      attemptId,
      sessionId, // Pass this to the reducer
      rewardXp,
    },
  });
}, [dispatch]);

  const resetGameState = useCallback(() => {
    isLocked.current = false;
    setFeedback(null);
    setRankNotice(null);
    setBonusNotice(null);
    setSelectedOption(null);
    setIsSubmitting(false);
    dispatch({ type: "RESET_GAME" });
  }, []);

  return {
    ...state,
    feedback,
    rankNotice,
    bonusNotice,
    selectedOption,
    isSubmitting,
    startChallengeGame,
    submitAnswer: handleSubmission,
    resetGameState,
    dispatch,
  };
};