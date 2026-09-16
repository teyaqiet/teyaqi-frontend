/**
 * @teyaqi-feat: Teyaqi-State-Machine
 */

"use client";

import {
  GameState,
  GameAction,
} from "./gameTypes";

import { initialState } from "./state";

export { initialState };

export function gameReducer(
  state: GameState,
  action: GameAction
): GameState {
  switch (action.type) {
    // ========================================================
    // PRELOAD CHALLENGE METADATA
    // ========================================================

    case "PRELOAD_CHALLENGE_META": {
      return {
        ...state,

        questions:
          action.payload.questions ?? state.questions,

        lives:
          action.payload.lives ?? state.lives,

        sr:
          action.payload.sr ?? state.sr,

        timeLimit:
          Number(action.payload.timeLimit ?? state.timeLimit),

        timeMode:
          action.payload.timeMode ?? state.timeMode,

        rewardXp:
          action.payload.rewardXp ?? state.rewardXp,

        attemptId:
          action.payload.attemptId ?? state.attemptId,

        sessionId:
          action.payload.sessionId ?? state.sessionId,

        resetTime:
          action.payload.resetTime ?? state.resetTime,
      };
    }

    // ========================================================
    // START GAME
    // ========================================================

    case "START_GAME": {
      const mode =
        action.payload.timeMode ?? "per_session";

      const limit =
        Number(action.payload.timeLimit ?? 60);

      return {
        ...state,

        status: "playing",

        questions: action.payload.questions,

        lives: action.payload.lives,

        sr: action.payload.sr,

        attemptId:
          action.payload.attemptId ?? null,

        sessionId:
          action.payload.sessionId ?? null,

        resetTime:
          action.payload.resetTime ?? null,

        timeMode: mode,

        timeLimit: limit,

        timeLeft: limit,

        timeSpent: 0,

        currentQuestionIndex: 0,

        savedResponses: [],

        streak: 0,

        maxStreak: 0,

        wrongStreak: 0,

        xp: 0,

        correctCount: 0,

        rewardXp:
          action.payload.rewardXp ?? 0,

        lastPredictedXP: 0,

        isCorrect: null,

        shouldShowCelebration: false,
      };
    }

    // ========================================================
    // CLOCK
    // ========================================================

    case "TICK_CLOCK": {
      if (state.status !== "playing") {
        return state;
      }

      const newTimeLeft = Math.max(
        0,
        state.timeLeft - 1
      );

      const isTimeOut =
        newTimeLeft <= 0;

      // ------------------------------------------------------
      // PER QUESTION TIMEOUT
      // ------------------------------------------------------

      if (
        isTimeOut &&
        state.timeMode === "per_question"
      ) {
        const currentQuestion =
          state.questions[
            state.currentQuestionIndex
          ];

        // Safety guard
        if (!currentQuestion) {
          return {
            ...state,
            timeLeft: 0,
            status: "completed",
          };
        }

        const expiredResponse = {
          question_id: currentQuestion.id,

          selected_option: "none",

          remaining_time: 0,

          is_correct: false,
        };

        const savedResponses = [
          ...state.savedResponses,
          expiredResponse,
        ];

        const nextIndex =
          state.currentQuestionIndex + 1;

        const outOfBounds =
          nextIndex >= state.questions.length;

        const newLives = Math.max(
          0,
          state.lives - 1
        );

        return {
          ...state,

          timeLeft: state.timeLimit,

          timeSpent:
            state.timeSpent + 1,

          lives: newLives,

          streak: 0,

          wrongStreak:
            state.wrongStreak + 1,

          isCorrect: false,

          savedResponses,

          currentQuestionIndex:
            outOfBounds
              ? state.currentQuestionIndex
              : nextIndex,

          status:
            newLives <= 0
              ? "gameover"
              : outOfBounds
                ? "completed"
                : "playing",
        };
      }

      // ------------------------------------------------------
      // PER SESSION TIMEOUT
      // ------------------------------------------------------

      if (
        isTimeOut &&
        state.timeMode === "per_session"
      ) {
        return {
          ...state,

          timeLeft: 0,

          timeSpent:
            state.timeSpent + 1,

          status: "completed",
        };
      }

      // ------------------------------------------------------
      // NORMAL TICK
      // ------------------------------------------------------

      return {
        ...state,

        timeLeft: newTimeLeft,

        timeSpent:
          state.timeSpent + 1,
      };
    }

    // ========================================================
    // SUBMIT ANSWER
    // ========================================================

    case "SUBMIT_ANSWER": {
      const {
        isCorrect,
        predictedXP = 0,
        selectedOption,
        remainingTimeSeconds = 0,
        newSr,
      } = action.payload;

      const currentQuestion =
        state.questions[
          state.currentQuestionIndex
        ];

      // Safety guard
      if (!currentQuestion) {
        return state;
      }

      const newLives = isCorrect
        ? state.lives
        : Math.max(0, state.lives - 1);

      const isGameOver =
        newLives <= 0;

      const currentStreak =
        isCorrect
          ? state.streak + 1
          : 0;

      const computedMaxStreak =
        Math.max(
          state.maxStreak,
          currentStreak
        );

      const responsePayload = {
        question_id:
          currentQuestion.id,

        selected_option:
          selectedOption.toLowerCase(),

        remaining_time:
          remainingTimeSeconds,

        is_correct:
          isCorrect,
      };

      return {
        ...state,

        isCorrect,

        xp:
          state.xp + predictedXP,

        correctCount:
          isCorrect
            ? state.correctCount + 1
            : state.correctCount,

        lastPredictedXP:
          predictedXP,

        lives:
          newLives,

        streak:
          currentStreak,

        maxStreak:
          computedMaxStreak,

        wrongStreak:
          isCorrect
            ? 0
            : state.wrongStreak + 1,

        sr:
          newSr ?? state.sr,

        status:
          isGameOver
            ? "gameover"
            : state.status,

        savedResponses: [
          ...state.savedResponses,
          responsePayload,
        ],
      };
    }

    // ========================================================
    // NEXT QUESTION
    // ========================================================

    case "NEXT_QUESTION": {
      if (state.lives <= 0) {
        return {
          ...state,
          status: "gameover",
        };
      }

      const nextIndex =
        state.currentQuestionIndex + 1;

      if (
        nextIndex >=
        state.questions.length
      ) {
        return {
          ...state,

          status: "completed",

          isCorrect: null,
        };
      }

      return {
        ...state,

        currentQuestionIndex:
          nextIndex,

        isCorrect: null,

        status: "playing",

        timeLeft:
          state.timeMode === "per_question"
            ? state.timeLimit
            : state.timeLeft,
      };
    }

    // ========================================================
    // SYNC SERVER DATA
    // ========================================================

    case "SYNC_SERVER_DATA": {
      return {
        ...state,

        xp: action.payload.xp,

        sr: action.payload.sr,

        streak: action.payload.streak,

        lastPlayedAt:
          action.payload.last_played,
      };
    }

    // ========================================================
    // UPDATE LIVES
    // ========================================================

    case "UPDATE_LIVES": {
      return {
        ...state,

        lives: action.payload.lives,

        resetTime:
          action.payload.resetTime ??
          state.resetTime,
      };
    }

    // ========================================================
    // CLOSE CELEBRATION
    // ========================================================

    case "CLOSE_CELEBRATION": {
      return {
        ...state,

        shouldShowCelebration: false,
      };
    }

    // ========================================================
    // RESET
    // ========================================================

    case "RESET_GAME": {
      return {
        ...initialState,
      };
    }

    // ========================================================
    // FALLBACK
    // ========================================================

    default:
      return state;
  }
}