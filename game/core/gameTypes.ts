/**
 * @teyaqi-feat: Teyaqi-Type-System
 */

"use client";

// ============================================================
// GAME STATUS
// ============================================================

export type GameStatus =
  | "idle"
  | "playing"
  | "paused"
  | "completed"
  | "gameover";

// ============================================================
// STREAK
// ============================================================

export type StreakStatus =
  | "active"
  | "frozen"
  | "dead";

// ============================================================
// CHALLENGE
// ============================================================

export type ChallengeTimeMode =
  | "per_session"
  | "per_question";

// ============================================================
// DIFFICULTY
// ============================================================

export type DifficultyLevel =
  | "easy"
  | "medium"
  | "hard";

// ============================================================
// QUESTION TYPES
// ============================================================

export interface QuestionOption {
  key: string;
  option_text: string;
  is_correct: boolean;
}

export interface MappedQuestion {
  id: number;
  image_url: string | null;
  question_text: string;
  options: QuestionOption[];
  correct_answer: string;
}

// ============================================================
// SAVED RESPONSE
// ============================================================

export interface SavedResponse {
  question_id: number;
  selected_option: string;
  remaining_time?: number;
  is_correct?: boolean;
}

// ============================================================
// GAME STATE
// ============================================================

export interface GameState {
  status: GameStatus;

  questions: MappedQuestion[];

  currentQuestionIndex: number;

  // Player resources
  lives: number;

  // XP
  xp: number;
  rewardXp: number;
  lastPredictedXP: number;

  // Answer tracking
  correctCount: number;

  // Streak
  streak: number;
  maxStreak: number;
  streakStatus: StreakStatus;

  // Server/player data
  lastPlayedAt: string | null;
  sr: number;

  // Wrong answer tracking
  wrongStreak: number;

  // Current answer
  isCorrect: boolean | null;

  // Celebration
  shouldShowCelebration: boolean;

  // Timing
  timeMode: ChallengeTimeMode;
  timeLimit: number;
  timeLeft: number;
  timeSpent: number;

  // Responses
  savedResponses: SavedResponse[];

  // Challenge/session identifiers
  attemptId: number | string | null;
  sessionId?: number | string | null;

  // Lives reset
  resetTime?: string | null;
}

// ============================================================
// GAME ACTIONS
// ============================================================

export type GameAction =
  // ----------------------------------------------------------
  // PRELOAD CHALLENGE
  // ----------------------------------------------------------

  | {
      type: "PRELOAD_CHALLENGE_META";

      payload: {
        questions?: MappedQuestion[];

        lives?: number;

        sr?: number;

        timeMode?: ChallengeTimeMode;

        timeLimit?: number;

        rewardXp?: number;

        attemptId?: number | string | null;

        sessionId?: number | string | null;

        resetTime?: string | null;
      };
    }

  // ----------------------------------------------------------
  // START GAME
  // ----------------------------------------------------------

  | {
      type: "START_GAME";

      payload: {
        questions: MappedQuestion[];

        lives: number;

        sr: number;

        timeMode?: ChallengeTimeMode;

        timeLimit?: number;

        attemptId?: number | string | null;

        sessionId?: number | string | null;

        resetTime?: string | null;

        rewardXp: number;
      };
    }

  // ----------------------------------------------------------
  // SUBMIT ANSWER
  // ----------------------------------------------------------

  | {
      type: "SUBMIT_ANSWER";

      payload: {
        selectedOption: string;

        isCorrect: boolean;

        timeMs: number;

        predictedXP?: number;

        remainingTimeSeconds?: number;

        newSr?: number;

        srChange?: number;

        questionDifficultyScore?: number;

        questionDifficulty?: string;
      };
    }

  // ----------------------------------------------------------
  // SYNC SERVER DATA
  // ----------------------------------------------------------

  | {
      type: "SYNC_SERVER_DATA";

      payload: {
        xp: number;

        sr: number;

        streak: number;

        last_played: string | null;
      };
    }

  // ----------------------------------------------------------
  // UPDATE LIVES
  // ----------------------------------------------------------

  | {
      type: "UPDATE_LIVES";

      payload: {
        lives: number;

        resetTime?: string | null;
      };
    }

  // ----------------------------------------------------------
  // CLOCK
  // ----------------------------------------------------------

  | {
      type: "TICK_CLOCK";
    }

  // ----------------------------------------------------------
  // QUESTIONS
  // ----------------------------------------------------------

  | {
      type: "NEXT_QUESTION";
    }

  // ----------------------------------------------------------
  // CELEBRATION
  // ----------------------------------------------------------

  | {
      type: "CLOSE_CELEBRATION";
    }

  // ----------------------------------------------------------
  // RESET
  // ----------------------------------------------------------

  | {
      type: "RESET_GAME";
    };