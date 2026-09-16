/**
 * @teyaqi-feat: Teyaqi-Frontend-Bridge
 * @teyaqi-info: Primary API wrapper for the Next.js frontend.
 *
 * Responsibilities:
 * - Telegram WebApp authentication
 * - API authentication synchronization
 * - Multi-language content parsing
 * - Daily quiz synchronization
 * - Challenge synchronization
 * - User statistics
 * - Daily rewards
 * - Streak freeze
 * - Display-only life regeneration
 *
 * IMPORTANT:
 * The Laravel backend is ALWAYS the source of truth for:
 * - correctness
 * - lives
 * - XP
 * - streaks
 * - SR
 * - question difficulty
 * - challenge rewards
 */

import { fetcher } from "@/lib/api";

// ============================================================
// CORE TYPE CONTRACTS
// ============================================================

export interface TranslatableText {
  en?: string;
  am?: string;
  amh?: string;
  [key: string]: string | undefined;
}

export interface QuizOption {
  key: string;
  option_text: string;
  is_correct: boolean;
}

export interface UnifiedQuestion {
  id: number;
  image_url: string | null;
  question_text: string;
  options: QuizOption[];
  correct_answer: string;
}

export interface DailyQuizPayload {
  questions: UnifiedQuestion[];
  sessionId: string | number | null;
  lives: number;
  sr: number;
  resetTime: string | null;
}

export interface ChallengeStartPayload {
  questions: UnifiedQuestion[];
  attemptId: number | string | null;
  timeMode: "per_session" | "per_question";
  timeLimit: number;
  rewardXp: number;
  rewardCoins: number;
}

export interface ChallengeTelemetryPayload {
  time_spent: number;
  max_streak: number;
  remaining_time_seconds: number | null;
  total_xp_earned?: number;
  total_coins_earned?: number;

  responses: Array<{
    question_id: number;
    selected_option: string;
    remaining_time?: number;
    is_correct?: boolean;
  }>;
}

export interface DailyGameFinishPayload {
  session_id: string | number;
}

export interface ChallengeRealTimeTrackPayload {
  question_id: number;
  selected_option: string;
  is_correct: boolean;
  time_spent: number;
}

// ============================================================
// QUIZ SUBMISSION RESPONSE
// ============================================================

export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  is_game_over: boolean;

  xp_gained: number;
  streak_count: number;

  daily_streak: any;

  base_xp: number;
  bonus_xp: number;
  xp_earned: number;

  correct_count: number;
  lives_remaining: number;

  // User adaptive rating
  new_sr: number;
  previous_sr: number;
  sr_change: number;
  best_sr: number;

  // Question adaptive difficulty
  question_difficulty_score: number;
  question_difficulty: "easy" | "medium" | "hard" | string;
  question_score_change: number;

  // Elo / adaptive diagnostic
  expected_probability: number;
}

// ============================================================
// FINISH GAME RESPONSE
// ============================================================

export interface FinishGameResponse {
  status: string;
  already_completed: boolean;

  data: {
    session_id: string | number;

    is_completed: boolean;

    correct_answers: number;
    total_questions: number;

    lives_lost: number;

    xp_earned: number;
    perfect_bonus: number;
    base_xp: number;
    bonus_xp: number;

    current_streak: number;

    user_sr: number;
    best_sr: number;

    daily_lives: number;

    total_xp: number;

    streak: number;
  };
}

// ============================================================
// INTERNAL API TYPES
// ============================================================

interface DailyQuizApiResponse {
  data?: {
    questions?: any[];

    session_id: string | number;

    lives: number;

    user_sr?: number;

    next_reset_at?: string;

    reset_time?: string;
  };
}

interface ChallengeApiResponse {
  success?: boolean;

  attempt_id: number | string;

  questions?: any[];

  challenge?: {
    id: number;

    title: string;

    time_mode?: "per_session" | "per_question";

    time_limit?: number | string;

    reward_xp?: number;

    reward_coins?: number;
  };
}

// ============================================================
// BACKEND URL
// ============================================================

const getBackendUrl = (): string => {
  return (process.env.NEXT_PUBLIC_BACKEND_URL || "")
    .replace(/\/+$/, "");
};

// ============================================================
// LANGUAGE
// ============================================================

const getCurrentLanguage = (): "en" | "am" => {
  if (typeof window === "undefined") {
    return "en";
  }

  const savedLang = localStorage.getItem("teyaqi_lang");

  return savedLang === "am" ? "am" : "en";
};

// ============================================================
// TOKEN
// ============================================================

const getToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

const saveToken = (token: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("token", token);
};

const clearToken = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
};

// ============================================================
// TELEGRAM
// ============================================================

const getTelegramWebApp = (): any => {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as any).Telegram?.WebApp || null;
};

// ============================================================
// LOCALIZED TEXT
// ============================================================

/**
 * Extract localized text from Spatie-translatable JSON objects.
 */
const getLocalizedText = (
  obj: string | TranslatableText | null | undefined,
  currentLang: string
): string => {
  if (!obj) {
    return "";
  }

  if (typeof obj === "string") {
    return obj;
  }

  if (obj[currentLang]) {
    return obj[currentLang] as string;
  }

  const fallbacks = ["en", "am", "amh"];

  for (const key of fallbacks) {
    if (obj[key]) {
      return obj[key] as string;
    }
  }

  const firstValue = Object.values(obj)[0];

  return typeof firstValue === "string"
    ? firstValue
    : "";
};

// ============================================================
// QUESTION MAPPER
// ============================================================

const mapQuestion = (
  q: any,
  language: "en" | "am"
): UnifiedQuestion => {
  const correctAnswer = String(
    q?.correct_answer ?? ""
  ).toLowerCase();

  const options: QuizOption[] = [
    "a",
    "b",
    "c",
    "d",
  ].map((key) => {
    const option =
      q?.options?.[key] ??
      q?.[`option_${key}`] ??
      "";

    return {
      key: key.toUpperCase(),

      option_text: getLocalizedText(
        option,
        language
      ),

      is_correct:
        correctAnswer === key,
    };
  });

  return {
    id: Number(q?.id),

    image_url:
      q?.image_url ||
      q?.image ||
      null,

    question_text:
      getLocalizedText(
        q?.question_text,
        language
      ),

    options,

    correct_answer: correctAnswer,
  };
};

// ============================================================
// AUTHENTICATION LOCK
// ============================================================

/**
 * Prevents multiple simultaneous Telegram authentication
 * requests.
 *
 * Example:
 *
 * Component A calls auth
 * Component B calls auth
 *
 * Only ONE network request is made.
 */
let telegramAuthPromise:
  | Promise<boolean>
  | null = null;

// ============================================================
// GAME SERVICE
// ============================================================

export const gameService = {
  // ==========================================================
  // TELEGRAM AUTH
  // ==========================================================

  async handleTelegramAuth(
    initData?: string
  ): Promise<boolean> {
    // If another authentication request is already running,
    // wait for that request instead of creating another one.
    if (telegramAuthPromise) {
      console.log(
        "🔐 Telegram auth already in progress. Reusing existing request."
      );

      return telegramAuthPromise;
    }

    telegramAuthPromise = (async () => {
      try {
        const tg = getTelegramWebApp();

        if (tg?.ready) {
          tg.ready();
        }

        const finalInitData =
          initData ||
          tg?.initData ||
          "";

        if (!finalInitData) {
          console.warn(
            "⚠️ Cannot authenticate: Missing Telegram InitData."
          );

          return false;
        }

        console.log(
          "🚀 Exchanging Telegram InitData with Laravel backend..."
        );

        const response = await fetch(
          `${getBackendUrl()}/api/auth/telegram`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",

              "ngrok-skip-browser-warning":
                "true",
            },

            body: JSON.stringify({
              init_data: finalInitData,
            }),
          }
        );

        let data: any = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          console.error(
            "❌ Telegram auth rejected:",
            {
              status: response.status,
              response: data,
            }
          );

          clearToken();

          return false;
        }

        if (!data?.token) {
          console.error(
            "❌ Telegram authentication returned no token:",
            data
          );

          clearToken();

          return false;
        }

        saveToken(data.token);

        console.log(
          "✅ Telegram authentication successful."
        );

        return true;
      } catch (error) {
        console.error(
          "❌ Telegram authentication failed:",
          error
        );

        clearToken();

        return false;
      } finally {
        telegramAuthPromise = null;
      }
    })();

    return telegramAuthPromise;
  },

  // ==========================================================
  // ENSURE AUTHENTICATION
  // ==========================================================

  async ensureAuthenticated(
    initData?: string
  ): Promise<boolean> {
    const existingToken = getToken();

    /**
     * If we already have a token, don't authenticate again.
     *
     * This is especially important when HomePage remounts.
     */
    if (existingToken) {
      return true;
    }

    return this.handleTelegramAuth(initData);
  },

  // ==========================================================
  // DAILY QUIZ
  // ==========================================================

  async getDailyQuiz(): Promise<DailyQuizPayload> {
    try {
      const language = getCurrentLanguage();
      const token = getToken();

      const response =
        await fetcher<DailyQuizApiResponse>(
          "/api/quiz/daily",
          {
            headers: {
              "X-Language": language,

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

      if (!response?.data?.questions) {
        console.warn(
          "⚠️ No questions returned from API."
        );

        return {
          questions: [],
          sessionId: null,
          lives: 0,
          sr: 0,
          resetTime: null,
        };
      }

      const mappedQuestions =
        response.data.questions.map(
          (q: any) =>
            mapQuestion(q, language)
        );

      return {
        questions: mappedQuestions,

        sessionId:
          response.data.session_id,

        lives:
          Number(response.data.lives),

        sr:
          Number(
            response.data.user_sr ?? 50
          ),

        resetTime:
          response.data.next_reset_at ||
          response.data.reset_time ||
          null,
      };
    } catch (error) {
      console.error(
        "❌ GameService.getDailyQuiz:",
        error
      );

      throw error;
    }
  },

  // ==========================================================
  // SUBMIT ONE QUIZ ANSWER
  // ==========================================================

  async submitAnswer(
    questionId: number,
    selected: string,
    sessionId: string | number,
    timeTakenMs: number
  ): Promise<SubmitAnswerResponse> {
    try {
      const response =
        await fetcher<{
          status: string;
          data: SubmitAnswerResponse;
        }>(
          "/api/quiz/submit",
          {
            method: "POST",

            body: JSON.stringify({
              question_id:
                Number(questionId),

              selected_option:
                selected
                  ? selected.toLowerCase()
                  : "timeout",

              session_id:
                sessionId,

              time_taken_ms:
                Math.max(
                  0,
                  Number(timeTakenMs) || 0
                ),
            }),
          }
        );

      if (!response?.data) {
        throw new Error(
          "Invalid answer submission response."
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        "❌ Quiz answer submission failed:",
        error
      );

      throw error;
    }
  },

  // ==========================================================
  // FINISH DAILY GAME
  // ==========================================================

  async finishGame(
    sessionId: string | number
  ): Promise<FinishGameResponse["data"]> {
    try {
      const numericSessionId =
        Number(sessionId);

      if (
        !Number.isInteger(
          numericSessionId
        ) ||
        numericSessionId <= 0
      ) {
        throw new Error(
          `Invalid session ID: ${JSON.stringify(
            sessionId
          )}`
        );
      }

      console.log(
        "🏁 Finishing game session:",
        numericSessionId
      );

      const response =
        await fetcher<FinishGameResponse>(
          "/api/quiz/finish",
          {
            method: "POST",

            body: JSON.stringify({
              session_id:
                numericSessionId,
            }),
          }
        );

      return response.data;
    } catch (error) {
      console.error(
        "❌ Failed to finish game session:",
        error
      );

      throw error;
    }
  },

  // ==========================================================
  // CHALLENGES
  // ==========================================================

  async startChallenge(
    challengeId: number | string
  ): Promise<ChallengeStartPayload> {
    try {
      const language =
        getCurrentLanguage();

      const response =
        await fetcher<ChallengeApiResponse>(
          `/api/challenges/${challengeId}/start`,
          {
            method: "POST",

            headers: {
              "X-Language": language,
            },
          }
        );

      const dataPayload =
        (response as any)?.data ||
        response;

      if (
        !dataPayload?.questions ||
        !Array.isArray(
          dataPayload.questions
        ) ||
        dataPayload.questions.length === 0
      ) {
        console.warn(
          "⚠️ No challenge questions returned:",
          dataPayload
        );

        return {
          questions: [],
          attemptId: null,
          timeMode: "per_session",
          timeLimit: 60,
          rewardXp: 0,
          rewardCoins: 0,
        };
      }

      const mappedQuestions =
        dataPayload.questions.map(
          (q: any) =>
            mapQuestion(q, language)
        );

      return {
        questions:
          mappedQuestions,

        attemptId:
          dataPayload.attempt_id ??
          null,

        timeMode:
          dataPayload.challenge
            ?.time_mode ||
          "per_session",

        timeLimit:
          Number(
            dataPayload.challenge
              ?.time_limit
          ) || 60,

        rewardXp:
          Number(
            dataPayload.challenge
              ?.reward_xp
          ) || 0,

        rewardCoins:
          Number(
            dataPayload.challenge
              ?.reward_coins
          ) || 0,
      };
    } catch (error) {
      console.error(
        "❌ Failed to initialize challenge:",
        error
      );

      throw error;
    }
  },

  // ==========================================================
  // CHALLENGE SESSION SUBMISSION
  // ==========================================================

  async submitChallengeSession(
    payload: {
      attempt_id: number | string;

      responses: Array<{
        question_id: number;
        selected_option: string;
        remaining_time?: number;
        is_correct?: boolean;
      }>;

      time_spent: number;
      max_streak: number;
      total_xp_earned: number;
    }
  ): Promise<any> {
    try {
      const {
        attempt_id,
        ...telemetryData
      } = payload;

      const response =
        await fetcher<{
          data: any;
        }>(
          `/api/challenge-attempts/${attempt_id}/submit`,
          {
            method: "POST",

            body:
              JSON.stringify(
                telemetryData
              ),
          }
        );

      return response.data;
    } catch (error) {
      console.error(
        `❌ Failed to submit challenge attempt ${payload.attempt_id}:`,
        error
      );

      throw error;
    }
  },

  // ==========================================================
  // CHALLENGE ATTEMPT SUBMISSION
  // ==========================================================

  async submitChallengeAttempt(
    attemptId: number | string,
    payload: ChallengeTelemetryPayload
  ): Promise<any> {
    try {
      const response =
        await fetcher<{
          data: any;
        }>(
          `/api/challenge-attempts/${attemptId}/submit`,
          {
            method: "POST",

            body:
              JSON.stringify(payload),
          }
        );

      return response.data;
    } catch (error) {
      console.error(
        `❌ Failed to submit challenge attempt ${attemptId}:`,
        error
      );

      throw error;
    }
  },

  // ==========================================================
  // REAL-TIME CHALLENGE TRACKING
  // ==========================================================

  async submitChallengeAnswer(
    attemptId: number | string,
    payload: ChallengeRealTimeTrackPayload
  ): Promise<any> {
    try {
      const response =
        await fetcher<{
          data: any;
        }>(
          `/api/challenges/attempts/${attemptId}/track`,
          {
            method: "POST",

            body:
              JSON.stringify(payload),
          }
        );

      return response?.data;
    } catch (error) {
      console.error(
        `❌ Real-time challenge tracking failed for ${attemptId}:`,
        error
      );

      throw error;
    }
  },

  // ==========================================================
  // USER
  // ==========================================================

  async getUserStats(): Promise<any> {
    try {
      const language =
        getCurrentLanguage();

      const token =
        getToken();

      const response =
        await fetcher<{
          data: any;
        }>(
          "/api/user",
          {
            headers: {
              "X-Language":
                language,

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

      return {
        ...(response?.data || {}),

        challenges:
          response?.data?.challenges ||
          [],
      };
    } catch (error) {
      console.error(
        "❌ Failed to fetch user stats:",
        error
      );

      throw error;
    }
  },

  // ==========================================================
  // DAILY REWARD
  // ==========================================================

  async claimDailyReward(): Promise<any> {
    try {
      return await fetcher(
        "/api/user/claim-daily",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "❌ Daily reward claim failed:",
        error
      );

      throw error;
    }
  },

  // ==========================================================
  // STREAK FREEZE
  // ==========================================================

  async useFreezeShield(): Promise<any> {
    try {
      return await fetcher(
        "/api/user/streak/freeze",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "❌ Failed to use freeze shield:",
        error
      );

      throw error;
    }
  },
};

// ============================================================
// CLIENT STATE ENGINE
// ============================================================

export const MAX_LIVES = 5;

export const REGEN_TIME_MINS = 30;

// ============================================================
// DISPLAY-ONLY LIFE REGENERATION
// ============================================================

/**
 * Calculates client-side display-only life regeneration.
 *
 * IMPORTANT:
 * Laravel remains authoritative.
 *
 * This function only calculates what should be displayed
 * between server synchronizations.
 */
export const calculateRegen = (
  dbLives: number,
  lastUpdate: string
) => {
  const now =
    Date.now();

  const last =
    new Date(lastUpdate).getTime();

  if (
    !Number.isFinite(last)
  ) {
    return {
      lives:
        Math.min(
          MAX_LIVES,
          Math.max(0, Number(dbLives) || 0)
        ),

      nextHeartInMs:
        0,

      isFull:
        Number(dbLives) >= MAX_LIVES,
    };
  }

  const diffMs =
    Math.max(
      0,
      now - last
    );

  const msInPeriod =
    REGEN_TIME_MINS *
    60 *
    1000;

  const gained =
    Math.floor(
      diffMs /
        msInPeriod
    );

  const currentTotal =
    Math.min(
      MAX_LIVES,

      Math.max(
        0,
        Number(dbLives) || 0
      ) + gained
    );

  const nextHeartInMs =
    msInPeriod -
    (diffMs % msInPeriod);

  return {
    lives:
      currentTotal,

    nextHeartInMs:
      currentTotal >= MAX_LIVES
        ? 0
        : nextHeartInMs,

    isFull:
      currentTotal >= MAX_LIVES,
  };
};

// ============================================================
// UPDATE LIVES
// ============================================================

/**
 * Display helper only.
 *
 * Backend remains authoritative.
 */
export const updateLives = (
  currentLives: number,
  pointsLost: number = 1
): number => {
  const remaining =
    Number(currentLives) -
    Number(pointsLost);

  return Math.max(
    0,
    remaining
  );
};

// ============================================================
// LEGACY SCORE HELPER
// ============================================================

/**
 * NOTE:
 * Keep this only if an old frontend component still needs it.
 *
 * Do NOT use this to calculate authoritative XP/rewards.
 * Laravel should calculate actual rewards.
 */
export const calculateScore = (
  timeLeft: number,
  streak: number
) => {
  const base = 10;

  const timeBonus =
    Math.floor(
      Number(timeLeft) * 2
    );

  let streakBonus = 0;

  if (streak === 3) {
    streakBonus = 30;
  } else if (streak > 3) {
    streakBonus =
      30 +
      (streak - 3) * 10;
  }

  return (
    base +
    timeBonus +
    streakBonus
  );
};