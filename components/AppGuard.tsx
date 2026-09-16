"use client";

import React, {
Suspense,
useCallback,
useEffect,
useRef,
useState,
} from "react";

import {
usePathname,
useRouter,
useSearchParams,
} from "next/navigation";

import {
ApiError,
fetcher,
} from "@/lib/api";

import GlobalLoading from "./GlobalLoading";

import {
StateType,
StateView,
} from "./common/StateView";

// ============================================================
// TYPES
// ============================================================

interface ErrorConfig {
type: StateType;
title?: string;
description?: string;
}

interface UserPayload {
has_onboarded?: boolean | number | string;
[key: string]: unknown;
}

// ============================================================
// APP GUARD CONTENT
// ============================================================

function AppGuardContent({
children,
}: {
children: React.ReactNode;
}) {
const [checking, setChecking] =
useState(true);

const [
errorConfig,
setErrorConfig,
] =
useState<ErrorConfig | null>(
null
);

const pathname =
usePathname();

const searchParams =
useSearchParams();

const router =
useRouter();

/**

* Prevent repeated successful verification.
  */
  const isVerifiedRef =
  useRef(false);

/**

* Prevent multiple verification calls from
* this AppGuard instance.
  */
  const verificationPromiseRef =
  useRef<Promise<void> | null>(
  null
  );

/**

* Keep latest route values accessible inside
* callbacks without constantly recreating them.
  */
  const pathnameRef =
  useRef(pathname);

const searchParamsRef =
useRef(searchParams);

useEffect(() => {
pathnameRef.current =
pathname;
}, [pathname]);

useEffect(() => {
searchParamsRef.current =
searchParams;
}, [searchParams]);

// ==========================================================
// VERIFY USER STATUS
// ==========================================================

const verifyUserStatus =
useCallback(
async (
force = false
): Promise<void> => {
/**
* Reuse existing verification request.
*/
if (
verificationPromiseRef.current
) {
return verificationPromiseRef.current;
}


    const verificationPromise =
      (async () => {
        /**
         * Immediate offline check.
         */
        if (
          typeof navigator !==
            "undefined" &&
          !navigator.onLine
        ) {
          setErrorConfig({
            type: "no-network",
          });

          setChecking(false);

          return;
        }

        /**
         * Already verified.
         */
        if (
          isVerifiedRef.current &&
          !force
        ) {
          setChecking(false);

          return;
        }

        const token =
          typeof window !==
          "undefined"
            ? localStorage.getItem(
                "token"
              )
            : null;

        const currentPath =
          (
            pathnameRef.current ||
            ""
          ).replace(
            /\/$/,
            ""
          );

        /**
         * Guests bypass profile verification.
         */
        if (
          !token ||
          token === "null" ||
          token === "undefined" ||
          token.trim() === ""
        ) {
          isVerifiedRef.current =
            true;

          setChecking(false);

          return;
        }

        /**
         * Never verify while already on onboarding.
         */
        if (
          currentPath ===
          "/onboarding"
        ) {
          setChecking(false);

          return;
        }

        setErrorConfig(null);
        setChecking(true);

        try {
          /**
           * Uses centralized fetcher.
           *
           * The fetcher now deduplicates simultaneous
           * /api/user requests across the application.
           */
          const response =
            await fetcher<
              | UserPayload
              | {
                  data: UserPayload;
                }
            >(
              "/api/user",
              {
                cacheTtlMs: 5_000,
                dedupe: true,
              }
            );

          const userPayload =
            response &&
            typeof response ===
              "object" &&
            "data" in response &&
            response.data &&
            typeof response.data ===
              "object"
              ? response.data
              : response;

          if (
            !userPayload ||
            typeof userPayload !==
              "object"
          ) {
            throw new Error(
              "Invalid profile payload."
            );
          }

          const isOnboarded =
            userPayload
              .has_onboarded;

          /**
           * Explicit false/0 means onboarding required.
           */
          if (
            isOnboarded === false ||
            isOnboarded === 0 ||
            isOnboarded === "0"
          ) {
            const currentQueries =
              searchParamsRef.current?.toString();

            const targetUrl =
              currentQueries
                ? `/onboarding?${currentQueries}`
                : "/onboarding";

            router.replace(
              targetUrl
            );

            setChecking(false);

            return;
          }

          /**
           * Important:
           *
           * Do NOT treat undefined as automatically
           * "not onboarded".
           *
           * Some backend responses may omit this field.
           */
          isVerifiedRef.current =
            true;

          setChecking(false);
        } catch (
          error: unknown
        ) {
          console.error(
            "[AppGuard] Verification failed:",
            error
          );

          /**
           * Explicit onboarding requirement.
           */
          if (
            error instanceof ApiError &&
            (
              error.status ===
                403 ||
              error.code ===
                "ONBOARDING_REQUIRED" ||
              error.message
                .toLowerCase()
                .includes(
                  "onboard"
                )
            )
          ) {
            const currentQueries =
              searchParamsRef.current?.toString();

            router.replace(
              currentQueries
                ? `/onboarding?${currentQueries}`
                : "/onboarding"
            );

            setChecking(false);

            return;
          }

          /**
           * Determine error state.
           */
          let type: StateType =
            "error";

          if (
            error instanceof ApiError
          ) {
            if (
              error.isNetworkError
            ) {
              type =
                "no-network";
            } else if (
              error.isUnauthorized
            ) {
              type =
                "auth-error";
            }
          } else if (
            !navigator.onLine ||
            (
              error instanceof Error &&
              (
                error.message
                  .toLowerCase()
                  .includes(
                    "failed to fetch"
                  ) ||
                error.message
                  .toLowerCase()
                  .includes(
                    "network"
                  )
              )
            )
          ) {
            type =
              "no-network";
          }

          setErrorConfig({
            type,

            description:
              type ===
              "no-network"
                ? undefined
                : error instanceof Error
                  ? error.message
                  : "Connection failure during routing sync.",
          });

          setChecking(false);
        }
      })();

    verificationPromiseRef.current =
      verificationPromise;

    try {
      await verificationPromise;
    } finally {
      verificationPromiseRef.current =
        null;
    }
  },
  [router]
);


// ==========================================================
// ONLINE / OFFLINE LISTENERS
// ==========================================================

useEffect(() => {
const handleOffline = () => {
setErrorConfig({
type: "no-network",
});


  setChecking(false);
};

const handleOnline = () => {
  if (
    !isVerifiedRef.current
  ) {
    void verifyUserStatus(
      true
    );
  } else {
    setErrorConfig(null);
  }
};

window.addEventListener(
  "offline",
  handleOffline
);

window.addEventListener(
  "online",
  handleOnline
);

return () => {
  window.removeEventListener(
    "offline",
    handleOffline
  );

  window.removeEventListener(
    "online",
    handleOnline
  );
};


}, [verifyUserStatus]);

// ==========================================================
// INITIAL VERIFICATION
// ==========================================================

useEffect(() => {
void verifyUserStatus();
}, [verifyUserStatus]);

// ==========================================================
// ERROR STATE
// ==========================================================

if (errorConfig) {
return (
<StateView
type={errorConfig.type}
title={errorConfig.title}
description={
errorConfig.description
}
fullScreen={true}
onRetry={() => {
isVerifiedRef.current =
false;


      setErrorConfig(null);

      void verifyUserStatus(
        true
      );
    }}
  />
);


}

// ==========================================================
// LOADING STATE
// ==========================================================

if (checking) {
return <GlobalLoading />;
}

// ==========================================================
// VERIFIED
// ==========================================================

return <>{children}</>;
}

// ============================================================
// APP GUARD
// ============================================================

export default function AppGuard({
children,
}: {
children: React.ReactNode;
}) {
return (
<Suspense
fallback={<GlobalLoading />}
> <AppGuardContent>
{children} </AppGuardContent> </Suspense>
);
}