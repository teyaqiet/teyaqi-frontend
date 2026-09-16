'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  HelpCircle,
  History,
  Atom,
  Globe,
  Trophy,
} from 'lucide-react';

import Lottie, {
  LottieRefCurrentProps,
} from 'lottie-react';

interface Category {
  id: number;
  name: string | Record<string, string>;
  slug?: string;
}

interface CategoryStepProps {
  categories: Category[];
  selectedCategories: number[];
  onToggle: (id: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

/* =========================================
   CATEGORY NAME HELPER
========================================= */

const getCategoryNameString = (
  name:
    | string
    | Record<string, string>
    | undefined
): string => {
  if (!name) return 'General';

  if (typeof name === 'string') {
    return name;
  }

  return (
    name.en ||
    Object.values(name)[0] ||
    'General'
  );
};

/* =========================================
   CATEGORY UI STYLES
========================================= */

const getCategoryStyles = (name: unknown) => {
  const nameStr =
    getCategoryNameString(
      name as
        | string
        | Record<string, string>
        | undefined
    );

  const normalized =
    nameStr.toLowerCase();

  if (
    normalized.includes('general') ||
    normalized.includes('knowledge')
  ) {
    return {
      bg: 'bg-blue-600',
      icon: (
        <HelpCircle
          className="w-6 h-6 text-white"
          strokeWidth={2.5}
        />
      ),
    };
  }

  if (normalized.includes('history')) {
    return {
      bg: 'bg-amber-500',
      icon: (
        <History
          className="w-6 h-6 text-white"
          strokeWidth={2.5}
        />
      ),
    };
  }

  if (normalized.includes('science')) {
    return {
      bg: 'bg-emerald-400',
      icon: (
        <Atom
          className="w-6 h-6 text-white"
          strokeWidth={2.5}
        />
      ),
    };
  }

  if (
    normalized.includes('geography')
  ) {
    return {
      bg: 'bg-rose-500',
      icon: (
        <Globe
          className="w-6 h-6 text-white"
          strokeWidth={2.5}
        />
      ),
    };
  }

  return {
    bg: 'bg-purple-600',
    icon: (
      <Trophy
        className="w-6 h-6 text-white"
        strokeWidth={2.5}
      />
    ),
  };
};

/* =========================================
   COMPONENT
========================================= */

export default function CategoryStep({
  categories,
  selectedCategories,
  onToggle,
  onSubmit,
  onBack,
  loading,
}: CategoryStepProps) {
  /* =======================================
     FALLBACK CATEGORIES
  ======================================= */

  const displayCategories =
    categories &&
    categories.length > 0
      ? categories
      : [
          {
            id: 1,
            name: 'General Knowledge',
          },
          {
            id: 2,
            name: 'History',
          },
          {
            id: 3,
            name: 'Science',
          },
          {
            id: 4,
            name: 'Geography',
          },
          {
            id: 5,
            name: 'Sports',
          },
        ];

  /* =======================================
     MASCOT ANIMATIONS
  ======================================= */

  const [idleAnimation, setIdleAnimation] =
    useState<any>(null);

  const [writingAnimation, setWritingAnimation] =
    useState<any>(null);

  const [isWriting, setIsWriting] =
    useState(false);

  const writingLottieRef =
    useRef<LottieRefCurrentProps>(null);

  /* =======================================
     TRACK SELECTION CHANGES
  ======================================= */

  const previousSelection =
    useRef<string>('');

  /* =======================================
     LOAD MASCOT ANIMATIONS
  ======================================= */

  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const [
          idleResponse,
          writingResponse,
        ] = await Promise.all([
          fetch(
            '/images/mascot/teyaqi_writing_idel.json'
          ),
          fetch(
            '/images/mascot/teyaqi_writing.json'
          ),
        ]);

        if (
          !idleResponse.ok ||
          !writingResponse.ok
        ) {
          throw new Error(
            'Failed to load mascot animations'
          );
        }

        const idleData =
          await idleResponse.json();

        const writingData =
          await writingResponse.json();

        setIdleAnimation(idleData);
        setWritingAnimation(writingData);
      } catch (error) {
        console.error(
          'Failed to load mascot animations:',
          error
        );
      }
    };

    loadAnimations();
  }, []);

  /* =======================================
     SELECTION → WRITING ANIMATION
  ======================================= */

  useEffect(() => {
    /*
     * Sort the IDs so that the comparison
     * doesn't depend on array ordering.
     */
    const currentSelection =
      [...selectedCategories]
        .sort((a, b) => a - b)
        .join(',');

    /*
     * Initial render:
     * don't trigger writing animation.
     */
    if (
      previousSelection.current === ''
    ) {
      previousSelection.current =
        currentSelection;

      return;
    }

    /*
     * Nothing changed.
     */
    if (
      currentSelection ===
      previousSelection.current
    ) {
      return;
    }

    previousSelection.current =
      currentSelection;

    /*
     * Play writing animation whenever
     * a category is selected OR unselected.
     */
    setIsWriting(true);

    requestAnimationFrame(() => {
      writingLottieRef.current?.goToAndPlay(
        0,
        true
      );
    });
  }, [selectedCategories]);

  /* =======================================
     WRITING FINISHED
  ======================================= */

  const handleWritingComplete = () => {
    setIsWriting(false);
  };

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="
      h-full
      min-h-0
      w-full
      max-w-md
      mx-auto
      px-5
      sm:px-6
      text-white
      select-none
      overflow-hidden
      flex
      flex-col
      animate-fade-in
    ">
      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="
        flex-1
        min-h-0
        flex
        flex-col
        overflow-hidden
      ">
        {/* =====================================
            MASCOT + HEADER
        ===================================== */}

        <div className="
          shrink-0
          pt-3
          sm:pt-5
          mb-4
          sm:mb-6
        ">
          <div className="
            flex
            items-center
            justify-center
            gap-3
            sm:gap-5
          ">
            {/* =================================
                MASCOT
            ================================= */}

            <div className="
              shrink-0
              w-[110px]
              h-[110px]
              sm:w-[135px]
              sm:h-[135px]
              lg:w-[145px]
              lg:h-[145px]
            ">
              {/* IDLE */}
              {!isWriting &&
                idleAnimation && (
                  <Lottie
                    animationData={
                      idleAnimation
                    }
                    loop={true}
                    autoplay={true}
                    className="
                      w-full
                      h-full
                    "
                  />
                )}

              {/* WRITING */}
              {isWriting &&
                writingAnimation && (
                  <Lottie
                    lottieRef={
                      writingLottieRef
                    }
                    animationData={
                      writingAnimation
                    }
                    loop={false}
                    autoplay={true}
                    onComplete={
                      handleWritingComplete
                    }
                    className="
                      w-full
                      h-full
                    "
                  />
                )}
            </div>

            {/* =================================
                TITLE
            ================================= */}

            <div className="
              flex-1
              min-w-0
              text-left
            ">
              <h2 className="
                text-[27px]
                sm:text-[32px]
                font-black
                leading-tight
                tracking-tight
                whitespace-nowrap
              ">
                What Are You Into?
              </h2>

              <p className="
                text-xs
                sm:text-sm
                text-slate-400
                font-medium
                mt-1.5
              ">
                Choose at least 4 topics
              </p>
            </div>
          </div>
        </div>

        {/* =====================================
            CATEGORY LIST
        ===================================== */}

        <div className="
          flex-1
          min-h-0
          overflow-y-auto
          overflow-x-hidden
          space-y-3
          pr-1
          [scrollbar-width:thin]
          [scrollbar-color:rgba(148,163,184,0.25)_transparent]
        ">
          {displayCategories.map(
            (cat) => {
              const isSelected =
                selectedCategories.includes(
                  cat.id
                );

              const ui =
                getCategoryStyles(
                  cat.name
                );

              const displayName =
                getCategoryNameString(
                  cat.name
                );

              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() =>
                    onToggle(cat.id)
                  }
                  disabled={loading}
                  className={`
                    w-full
                    flex
                    items-center
                    rounded-2xl
                    overflow-hidden
                    transition-all
                    duration-150
                    text-left
                    border-2

                    ${
                      isSelected
                        ? `
                          border-emerald-500
                          shadow-lg
                          shadow-emerald-500/10
                          scale-[0.99]
                        `
                        : `
                          border-transparent
                          opacity-95
                        `
                    }

                    ${
                      loading
                        ? 'cursor-not-allowed'
                        : 'cursor-pointer'
                    }
                  `}
                >
                  {/* =========================
                      ICON PANEL

                      No round icon background.
                  ========================= */}

                  <div
                    className={`
                      w-16
                      h-16
                      sm:w-[68px]
                      sm:h-[68px]
                      flex
                      items-center
                      justify-center
                      shrink-0
                      ${ui.bg}
                    `}
                  >
                    {ui.icon}
                  </div>

                  {/* =========================
                      CATEGORY NAME
                  ========================= */}

                  <div className="
                    flex-1
                    min-w-0
                    px-4
                    flex
                    items-center
                    justify-between
                    gap-3
                    bg-white
                    h-16
                    sm:h-[68px]
                  ">
                    <span className="
                      text-slate-900
                      font-bold
                      text-base
                      sm:text-lg
                      truncate
                    ">
                      {displayName}
                    </span>

                    {/* Selected Check */}
                    <div
                      className={`
                        shrink-0
                        w-6
                        h-6
                        rounded-full
                        border-2
                        flex
                        items-center
                        justify-center
                        transition-all
                        duration-150

                        ${
                          isSelected
                            ? `
                              bg-emerald-500
                              border-emerald-500
                            `
                            : `
                              border-slate-300
                              bg-transparent
                            `
                        }
                      `}
                    >
                      {isSelected && (
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>

        {/* =====================================
            FOOTER DESCRIPTION
        ===================================== */}

        <div className="
          shrink-0
          text-center
          mt-3
          sm:mt-5
          px-4
        ">
          <p className="
            text-[10px]
            sm:text-xs
            text-slate-400
            leading-relaxed
            max-w-[280px]
            mx-auto
          ">
            Choose topics you want to see
            in your daily trivia challenges.
          </p>
        </div>
      </div>

      {/* =====================================
          NAVIGATION
      ===================================== */}

      <div className="
        shrink-0
        w-full
        space-y-3
        sm:space-y-4
        pt-3
        sm:pt-5
        pb-1
      ">
        {/* START PLAYING */}

        <button
          type="button"
          onClick={onSubmit}
          disabled={
            selectedCategories.length < 4 ||
            loading
          }
          className="
            w-full
            bg-white
            text-emerald-600
            font-black
            py-3.5
            sm:py-4
            rounded-full
            text-base
            sm:text-lg
            uppercase
            tracking-wider
            transition-all
            disabled:opacity-50
            disabled:cursor-not-allowed
            shadow-xl
            active:scale-[0.99]
          "
        >
          {loading
            ? 'GETTING QUIZ READY...'
            : 'START PLAYING'}
        </button>

        {/* GO BACK */}

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="
            w-full
            text-slate-400
            font-bold
            py-1
            uppercase
            text-[10px]
            sm:text-xs
            tracking-wider
            transition-all
            block
            text-center
            hover:text-white
            disabled:opacity-50
          "
        >
          GO BACK
        </button>
      </div>
    </div>
  );
}

