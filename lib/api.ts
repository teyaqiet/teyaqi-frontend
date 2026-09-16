"use client";

// ============================================================
// TEYAQI API CLIENT
// ============================================================
//
// Centralized HTTP client for the Teyaqi frontend.
//
// Responsibilities:
// - API base URL management
// - Authentication token injection
// - Language header support
// - Request timeout
// - Abort / cancellation handling
// - GET request deduplication
// - Optional GET response caching
// - API error normalization
// - Cache invalidation
//
// IMPORTANT:
// Laravel is ALWAYS the source of truth for:
// - XP
// - Lives
// - Streaks
// - SR
// - Question correctness
// - Rewards
// - Difficulty
//
// The frontend may display temporary state, but must never
// replace backend-authoritative values.
// ============================================================

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || ""
).replace(/\/+$/, "");

export const API_TIMEOUT_MS = 15_000;

// ============================================================
// TYPES
// ============================================================

export interface FetcherOptions extends RequestInit {
  /**
   * Reuse an active identical GET request.
   *
   * Default: true
   */
  dedupe?: boolean;

  /**
   * Cache successful GET responses for this duration.
   *
   * 0 or omitted = no response cache.
   */
  cacheTtlMs?: number;
}

export interface ApiRequestOptions
  extends FetcherOptions {}

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

// ============================================================
// REQUEST STATE
// ============================================================

/**
 * Active GET requests.
 *
 * Multiple components requesting the same resource
 * simultaneously can share one network request.
 */
const pendingRequests =
  new Map<string, Promise<unknown>>();

/**
 * Short-lived successful GET responses.
 */
const responseCache =
  new Map<string, CacheEntry>();

// ============================================================
// API ERROR
// ============================================================

export class ApiError extends Error {
  status: number;
  code: string | null;
  raw: string;
  details: unknown;

  constructor(
    message: string,
    status = 0,
    code: string | null = null,
    raw = "",
    details: unknown = null
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.raw = raw;
    this.details = details;

    Object.setPrototypeOf(
      this,
      ApiError.prototype
    );
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isTimeout(): boolean {
    return this.status === 408;
  }
}

// ============================================================
// CONFIGURATION
// ============================================================

export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
};

export const isApiConfigured = (): boolean => {
  return Boolean(API_BASE_URL);
};

// ============================================================
// TOKEN HELPERS
// ============================================================

export const getStoredToken =
  (): string | null => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const token =
        localStorage.getItem("token");

      if (
        !token ||
        token === "null" ||
        token === "undefined" ||
        token.trim() === ""
      ) {
        return null;
      }

      return token.trim();
    } catch {
      return null;
    }
  };

export const setStoredToken = (
  token: string
): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const normalizedToken =
      token.trim();

    if (!normalizedToken) {
      clearStoredToken();
      return;
    }

    localStorage.setItem(
      "token",
      normalizedToken
    );

    // Authentication changed.
    // Do not reuse responses from another session.
    clearApiCache();
  } catch (error) {
    console.error(
      "[API] Failed to save authentication token:",
      error
    );
  }
};

export const clearStoredToken =
  (): void => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.removeItem("token");

      // Remove potentially user-specific cached data.
      clearApiCache();
    } catch (error) {
      console.error(
        "[API] Failed to clear authentication token:",
        error
      );
    }
  };

// ============================================================
// LANGUAGE
// ============================================================

export const getStoredLanguage =
  (): "en" | "am" => {
    if (typeof window === "undefined") {
      return "en";
    }

    try {
      const language =
        localStorage.getItem(
          "teyaqi_lang"
        );

      return language === "am"
        ? "am"
        : "en";
    } catch {
      return "en";
    }
  };

// ============================================================
// ENDPOINT NORMALIZATION
// ============================================================

const normalizeEndpoint = (
  endpoint: string
): string => {
  if (!endpoint) {
    return "/";
  }

  return endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
};

const buildUrl = (
  endpoint: string
): string => {
  return `${API_BASE_URL}${normalizeEndpoint(
    endpoint
  )}`;
};

// ============================================================
// REQUEST KEY
// ============================================================

/**
 * Generates a stable key for GET deduplication/cache.
 *
 * Authentication and language are included because the same
 * endpoint can return different data for different users or
 * languages.
 */
const createRequestKey = (
  url: string,
  options: FetcherOptions
): string => {
  const method = (
    options.method || "GET"
  ).toUpperCase();

  const headers =
    new Headers(options.headers);

  const language =
    headers.get("X-Language") ||
    getStoredLanguage();

  const authorization =
    headers.get("Authorization") ||
    getStoredToken() ||
    "";

  return JSON.stringify([
    method,
    url,
    language,
    authorization,
  ]);
};

// ============================================================
// CACHE MANAGEMENT
// ============================================================

export const clearApiCache = (
  matcher?: string | RegExp
): void => {
  /**
   * No matcher means clear everything.
   */
  if (!matcher) {
    responseCache.clear();
    return;
  }

  for (const key of responseCache.keys()) {
    let shouldDelete = false;

    if (typeof matcher === "string") {
      shouldDelete = key.includes(matcher);
    } else {
      /**
       * Reset lastIndex for global/sticky regular expressions.
       * This prevents stateful RegExp behavior from causing
       * inconsistent cache invalidation.
       */
      matcher.lastIndex = 0;
      shouldDelete = matcher.test(key);
      matcher.lastIndex = 0;
    }

    if (shouldDelete) {
      responseCache.delete(key);
    }
  }
};

export const invalidateApiCache = (
  endpoint: string
): void => {
  clearApiCache(
    buildUrl(endpoint)
  );
};

// ============================================================
// ABORT / TIMEOUT
// ============================================================

const createCombinedSignal = (
  externalSignal:
    | AbortSignal
    | null
    | undefined,
  timeoutSignal: AbortSignal
): AbortSignal => {
  /**
   * No caller-provided signal.
   * Use timeout signal directly.
   */
  if (!externalSignal) {
    return timeoutSignal;
  }

  /**
   * Modern browsers.
   */
  if (
    typeof AbortSignal !==
      "undefined" &&
    typeof AbortSignal.any ===
      "function"
  ) {
    return AbortSignal.any([
      externalSignal,
      timeoutSignal,
    ]);
  }

  /**
   * Compatibility fallback.
   */
  const controller =
    new AbortController();

  const abort = () => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  };

  if (externalSignal.aborted) {
    abort();
  } else {
    externalSignal.addEventListener(
      "abort",
      abort,
      { once: true }
    );
  }

  timeoutSignal.addEventListener(
    "abort",
    abort,
    { once: true }
  );

  return controller.signal;
};

// ============================================================
// RESPONSE PARSING
// ============================================================

const parseResponseBody =
  async <T>(
    response: Response
  ): Promise<{
    data: T;
    rawBody: string;
  }> => {
    /**
     * No content.
     */
    if (
      response.status === 204 ||
      response.status === 205
    ) {
      return {
        data: null as T,
        rawBody: "",
      };
    }

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    const rawBody =
      await response.text();

    /**
     * Empty response.
     */
    if (!rawBody.trim()) {
      return {
        data: null as T,
        rawBody: "",
      };
    }

    const isJson =
      contentType.includes(
        "application/json"
      ) ||
      contentType.includes(
        "+json"
      );

    if (isJson) {
      try {
        return {
          data: JSON.parse(
            rawBody
          ) as T,
          rawBody,
        };
      } catch {
        throw new ApiError(
          "The server returned invalid JSON.",
          response.status,
          "INVALID_JSON",
          rawBody
        );
      }
    }

    /**
     * Some Laravel responses may return text.
     */
    return {
      data: rawBody as T,
      rawBody,
    };
  };

// ============================================================
// ERROR PARSING
// ============================================================

const getErrorCode = (
  responseData: unknown
): string | null => {
  if (
    !responseData ||
    typeof responseData !==
      "object"
  ) {
    return null;
  }

  const data =
    responseData as Record<
      string,
      unknown
    >;

  return typeof data.code === "string"
    ? data.code
    : null;
};

const getErrorMessage = (
  status: number,
  responseData: unknown
): string => {
  /**
   * Prefer backend-provided messages.
   */
  if (
    responseData &&
    typeof responseData ===
      "object"
  ) {
    const data =
      responseData as Record<
        string,
        unknown
      >;

    if (
      typeof data.message ===
      "string"
    ) {
      return data.message;
    }

    if (
      data.errors &&
      typeof data.errors ===
        "object"
    ) {
      return "The submitted data is invalid.";
    }
  }

  /**
   * Generic HTTP messages.
   */
  switch (status) {
    case 400:
      return "The request was invalid.";

    case 401:
      return "Your session has expired. Please log in again.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 408:
      return "The request timed out.";

    case 409:
      return "This request conflicts with the current state.";

    case 422:
      return "The submitted data is invalid.";

    case 429:
      return "Too many requests. Please try again shortly.";

    default:
      if (status >= 500) {
        return "Server error. Please try again later.";
      }

      return `Request failed with status ${status}.`;
  }
};

// ============================================================
// INTERNAL REQUEST
// ============================================================

const performRequest =
  async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    /**
     * API configuration check.
     */
    if (!API_BASE_URL) {
      console.error(
        "[API] NEXT_PUBLIC_BACKEND_URL is not configured."
      );

      throw new ApiError(
        "API configuration is missing. Please configure NEXT_PUBLIC_BACKEND_URL.",
        0,
        "API_CONFIG_MISSING"
      );
    }

    const url =
      buildUrl(endpoint);

    const token =
      getStoredToken();

    const timeoutController =
      new AbortController();

    const timeoutId =
      setTimeout(() => {
        timeoutController.abort();
      }, API_TIMEOUT_MS);

    const signal =
      createCombinedSignal(
        options.signal,
        timeoutController.signal
      );

    const headers =
      new Headers(options.headers);

    // --------------------------------------------------------
    // DEFAULT HEADERS
    // --------------------------------------------------------

    if (!headers.has("Accept")) {
      headers.set(
        "Accept",
        "application/json"
      );
    }

    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set(
        "Content-Type",
        "application/json"
      );
    }

    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    if (!headers.has("X-Language")) {
      headers.set(
        "X-Language",
        getStoredLanguage()
      );
    }

    // --------------------------------------------------------
    // DEVELOPMENT / NGROK
    // --------------------------------------------------------

    if (
      process.env.NODE_ENV ===
      "development"
    ) {
      headers.set(
        "ngrok-skip-browser-warning",
        "true"
      );
    }

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    if (
      token &&
      !headers.has("Authorization")
    ) {
      headers.set(
        "Authorization",
        token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`
      );
    }

    try {
      const response =
        await fetch(url, {
          ...options,
          headers,
          signal,
        });

      const {
        data: responseData,
        rawBody,
      } =
        await parseResponseBody<T>(
          response
        );

      // ------------------------------------------------------
      // HTTP ERROR
      // ------------------------------------------------------

      if (!response.ok) {
        const code =
          getErrorCode(
            responseData
          );

        /**
         * A 401 means the local authentication session
         * can no longer be trusted.
         */
        if (
          response.status === 401
        ) {
          clearStoredToken();
        }

        if (
          process.env.NODE_ENV ===
          "development"
        ) {
          console.error(
            "━━━━━━━━ TEYAQI API ERROR ━━━━━━━━"
          );

          console.error(
            "URL:",
            url
          );

          console.error(
            "Method:",
            options.method || "GET"
          );

          console.error(
            "Status:",
            response.status
          );

          console.error(
            "Response:",
            responseData
          );

          console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          );
        }

        throw new ApiError(
          getErrorMessage(
            response.status,
            responseData
          ),
          response.status,
          code,
          rawBody,
          responseData
        );
      }

      return responseData;
    } catch (
      error: unknown
    ) {
      // ------------------------------------------------------
      // ALREADY NORMALIZED
      // ------------------------------------------------------

      if (
        error instanceof ApiError
      ) {
        throw error;
      }

      // ------------------------------------------------------
      // CALLER CANCELLATION
      // ------------------------------------------------------

      if (
        options.signal?.aborted &&
        !timeoutController.signal
          .aborted
      ) {
        throw new ApiError(
          "The request was cancelled.",
          499,
          "REQUEST_ABORTED",
          error instanceof Error
            ? error.message
            : String(error)
        );
      }

      // ------------------------------------------------------
      // REQUEST TIMEOUT
      // ------------------------------------------------------

      if (
        timeoutController.signal
          .aborted
      ) {
        console.error(
          `[API] Request timed out after ${
            API_TIMEOUT_MS / 1000
          } seconds:`,
          url
        );

        throw new ApiError(
          `Request timed out after ${
            API_TIMEOUT_MS / 1000
          } seconds.`,
          408,
          "REQUEST_TIMEOUT",
          error instanceof Error
            ? error.message
            : String(error)
        );
      }

      // ------------------------------------------------------
      // BROWSER ABORT ERROR
      // ------------------------------------------------------

      if (
        typeof DOMException !==
          "undefined" &&
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        throw new ApiError(
          "The request was cancelled.",
          499,
          "REQUEST_ABORTED",
          error.message
        );
      }

      if (
        error instanceof Error &&
        error.name ===
          "AbortError"
      ) {
        throw new ApiError(
          "The request was cancelled.",
          499,
          "REQUEST_ABORTED",
          error.message
        );
      }

      // ------------------------------------------------------
      // NETWORK / CORS / BACKEND ERROR
      // ------------------------------------------------------

      console.error(
        "[API] Network error:",
        error
      );

      console.error(
        "[API] URL:",
        url
      );

      throw new ApiError(
        "Failed to connect to the backend. Please check your connection or verify that the Laravel server is running.",
        0,
        "NETWORK_ERROR",
        error instanceof Error
          ? error.message
          : String(error)
      );
    } finally {
      clearTimeout(
        timeoutId
      );
    }
  };

// ============================================================
// MAIN FETCHER
// ============================================================

export const fetcher =
  async <T = unknown>(
    endpoint: string,
    options: FetcherOptions = {}
  ): Promise<T> => {
    const url =
      buildUrl(endpoint);

    const method = (
      options.method || "GET"
    ).toUpperCase();

    const isGetRequest =
      method === "GET";

    /**
     * Requests with an AbortSignal are not deduplicated.
     *
     * This prevents one caller's cancellation from affecting
     * another caller sharing the same promise.
     */
    const shouldDeduplicate =
      isGetRequest &&
      options.dedupe !== false &&
      !options.signal;

    const cacheTtlMs =
      isGetRequest
        ? Number(
            options.cacheTtlMs ?? 0
          )
        : 0;

    const requestKey =
      createRequestKey(
        url,
        options
      );

    // ========================================================
    // RESPONSE CACHE
    // ========================================================

    if (
      isGetRequest &&
      cacheTtlMs > 0
    ) {
      const cached =
        responseCache.get(
          requestKey
        );

      if (
        cached &&
        cached.expiresAt >
          Date.now()
      ) {
        if (
          process.env.NODE_ENV ===
          "development"
        ) {
          console.log(
            "[API] Using cached response:",
            requestKey
          );
        }

        return cached.data as T;
      }

      if (cached) {
        responseCache.delete(
          requestKey
        );
      }
    }

    // ========================================================
    // ACTIVE REQUEST DEDUPLICATION
    // ========================================================

    if (shouldDeduplicate) {
      const existingRequest =
        pendingRequests.get(
          requestKey
        );

      if (existingRequest) {
        if (
          process.env.NODE_ENV ===
          "development"
        ) {
          console.log(
            "[API] Reusing active request:",
            requestKey
          );
        }

        return existingRequest as Promise<T>;
      }
    }

    // ========================================================
    // CREATE REQUEST
    // ========================================================

    const request =
      performRequest<T>(
        endpoint,
        options
      ).then((response) => {
        /**
         * Cache successful GET responses only.
         */
        if (
          isGetRequest &&
          cacheTtlMs > 0
        ) {
          responseCache.set(
            requestKey,
            {
              data: response,
              expiresAt:
                Date.now() +
                cacheTtlMs,
            }
          );
        }

        return response;
      });

    // ========================================================
    // STORE ACTIVE REQUEST
    // ========================================================

    if (shouldDeduplicate) {
      pendingRequests.set(
        requestKey,
        request
      );
    }

    try {
      return await request;
    } finally {
      if (shouldDeduplicate) {
        /**
         * Only remove our own request.
         *
         * Protects against a newer request replacing the
         * current map entry before this request completes.
         */
        const current =
          pendingRequests.get(
            requestKey
          );

        if (current === request) {
          pendingRequests.delete(
            requestKey
          );
        }
      }
    }
  };

// ============================================================
// HTTP HELPERS
// ============================================================

export const api = {
  get: <T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ) =>
    fetcher<T>(
      endpoint,
      {
        ...options,
        method: "GET",
      }
    ),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {}
  ) =>
    fetcher<T>(
      endpoint,
      {
        ...options,
        method: "POST",
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
      }
    ),

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {}
  ) =>
    fetcher<T>(
      endpoint,
      {
        ...options,
        method: "PUT",
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
      }
    ),

  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {}
  ) =>
    fetcher<T>(
      endpoint,
      {
        ...options,
        method: "PATCH",
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
      }
    ),

  delete: <T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ) =>
    fetcher<T>(
      endpoint,
      {
        ...options,
        method: "DELETE",
      }
    ),
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default fetcher;

