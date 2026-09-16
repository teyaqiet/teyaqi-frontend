'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import Lottie, {
  LottieRefCurrentProps,
} from 'lottie-react';

interface AvatarOption {
  id: string;
  asset: string;
  gender: 'male' | 'female';
}

interface AvatarStepProps {
  selectedAvatar: string | null;
  onSelect: (option: AvatarOption | null) => void;
  onNext: () => void;
  onBack: () => void;
}

interface AvatarCarouselProps {
  title: string;
  characters: AvatarOption[];
  selectedAvatar: string | null;
  onSelect: (option: AvatarOption) => void;
  showHint?: boolean;
}

function AvatarCarousel({
  title,
  characters,
  selectedAvatar,
  onSelect,
  showHint = false,
}: AvatarCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollRight, setCanScrollRight] =
    useState(true);

  const [hasScrolled, setHasScrolled] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const hasDragged = useRef(false);

  /* =========================================
     CHECK SCROLL POSITION
  ========================================= */

  const checkScrollPosition = () => {
    const element = scrollRef.current;

    if (!element) return;

    const hasOverflow =
      element.scrollWidth >
      element.clientWidth + 5;

    const isAtEnd =
      element.scrollLeft +
        element.clientWidth >=
      element.scrollWidth - 10;

    setCanScrollRight(
      hasOverflow && !isAtEnd
    );

    if (element.scrollLeft > 10) {
      setHasScrolled(true);
    }
  };

  /* =========================================
     SCROLL LISTENER
  ========================================= */

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    checkScrollPosition();

    element.addEventListener(
      'scroll',
      checkScrollPosition
    );

    window.addEventListener(
      'resize',
      checkScrollPosition
    );

    return () => {
      element.removeEventListener(
        'scroll',
        checkScrollPosition
      );

      window.removeEventListener(
        'resize',
        checkScrollPosition
      );
    };
  }, []);

  /* =========================================
     DESKTOP MOUSE DRAG
  ========================================= */

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const element = scrollRef.current;

    if (!element) return;

    setIsDragging(true);

    hasDragged.current = false;

    dragStartX.current = event.pageX;
    scrollStartX.current =
      element.scrollLeft;
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const element = scrollRef.current;

    if (!element || !isDragging) return;

    const distance =
      event.pageX - dragStartX.current;

    if (Math.abs(distance) > 5) {
      hasDragged.current = true;
    }

    element.scrollLeft =
      scrollStartX.current - distance;
  };

  const stopDragging = () => {
    setIsDragging(false);

    setTimeout(() => {
      hasDragged.current = false;
    }, 0);
  };

  /* =========================================
     MOUSE WHEEL
  ========================================= */

  const handleWheel = (
    event: React.WheelEvent<HTMLDivElement>
  ) => {
    const element = scrollRef.current;

    if (!element) return;

    if (
      element.scrollWidth >
      element.clientWidth
    ) {
      event.preventDefault();

      element.scrollLeft +=
        event.deltaY ||
        event.deltaX;
    }
  };

  /* =========================================
     AVATAR CLICK
  ========================================= */

  const handleAvatarClick = (
    character: AvatarOption
  ) => {
    if (hasDragged.current) {
      return;
    }

    /*
     * Clicking the currently selected avatar
     * unselects it.
     */
    if (
      selectedAvatar ===
      character.asset
    ) {
      onSelect(null);
      return;
    }

    onSelect(character);
  };

  return (
    <div className="w-full">
      {/* =====================================
          SECTION HEADER
      ===================================== */}

      <div className="
        flex
        items-center
        gap-3
        mb-2
        sm:mb-3
        px-5
        sm:px-6
      ">
        <h3 className="
          text-xs
          sm:text-sm
          font-semibold
          text-slate-400
          uppercase
          tracking-wider
        ">
          {title}
        </h3>

        <div className="
          flex-1
          h-px
          bg-slate-700/30
        " />
      </div>

      {/* =====================================
          AVATAR CAROUSEL
      ===================================== */}

      <div className="relative">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onWheel={handleWheel}
          className={`
            flex
            gap-3
            sm:gap-4
            overflow-x-auto
            overflow-y-hidden
            px-5
            sm:px-6
            pb-1
            snap-x
            snap-mandatory
            scroll-smooth
            select-none
            touch-pan-x
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden

            ${
              isDragging
                ? 'cursor-grabbing'
                : 'cursor-grab'
            }
          `}
        >
          {characters.map((char) => {
            const isSelected =
              selectedAvatar ===
              char.asset;

            return (
              <button
                type="button"
                key={char.id}
                onClick={() =>
                  handleAvatarClick(char)
                }
                aria-label={
                  isSelected
                    ? `Unselect ${title} avatar ${char.id}`
                    : `Choose ${title} avatar ${char.id}`
                }
                className={`
                  shrink-0
                  snap-start
                  relative
                  overflow-hidden
                  rounded-xl
                  sm:rounded-2xl
                  border-[3px]
                  sm:border-4
                  transition-all
                  duration-150

                  w-[clamp(92px,28vw,140px)]
                  h-[clamp(92px,28vw,140px)]

                  ${
                    isSelected
                      ? `
                        border-emerald-500
                        scale-[1.03]
                        shadow-lg
                        shadow-emerald-500/20
                      `
                      : `
                        border-transparent
                        bg-slate-800
                        active:scale-[0.97]
                      `
                  }
                `}
              >
                <Image
                  src={char.asset}
                  alt={`${title} Avatar Option`}
                  fill
                  sizes="
                    (max-width: 640px) 28vw,
                    140px
                  "
                  className="
                    object-cover
                    pointer-events-none
                  "
                  draggable={false}
                />

                {/* Selected Check */}
                {isSelected && (
                  <div className="
                    absolute
                    top-1.5
                    right-1.5
                    sm:top-2
                    sm:right-2
                    w-6
                    h-6
                    sm:w-7
                    sm:h-7
                    rounded-full
                    bg-emerald-500
                    flex
                    items-center
                    justify-center
                    shadow-md
                  ">
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
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* =====================================
            RIGHT FADE
        ===================================== */}

        {canScrollRight && (
          <div className="
            pointer-events-none
            absolute
            right-0
            top-0
            bottom-1
            w-12
            sm:w-16
            bg-gradient-to-l
            from-slate-950
            via-slate-950/70
            to-transparent
          " />
        )}

        {/* =====================================
            ARROW
        ===================================== */}

        {canScrollRight && (
          <div className="
            pointer-events-none
            absolute
            right-1
            sm:right-2
            top-1/2
            -translate-y-1/2
            w-7
            h-7
            sm:w-8
            sm:h-8
            rounded-full
            bg-slate-900/90
            border
            border-slate-700/50
            flex
            items-center
            justify-center
            text-white/80
            shadow-lg
          ">
            <span className="
              text-base
              sm:text-lg
              leading-none
              animate-pulse
            ">
              →
            </span>
          </div>
        )}
      </div>

      {/* =====================================
          SWIPE HINT
      ===================================== */}

      {showHint &&
        !hasScrolled &&
        canScrollRight && (
          <div className="
            flex
            items-center
            justify-center
            gap-1.5
            mt-1
            text-slate-500
          ">
            <span className="
              text-[10px]
              sm:text-[11px]
              font-medium
            ">
              Swipe or drag to explore
            </span>

            <span className="
              text-xs
              animate-pulse
            ">
              →
            </span>
          </div>
        )}
    </div>
  );
}

export default function AvatarStep({
  selectedAvatar,
  onSelect,
  onNext,
  onBack,
}: AvatarStepProps) {
  const maleCharacters: AvatarOption[] = [
    {
      id: 'm1',
      asset: '/images/avatars/M1.webp',
      gender: 'male',
    },
    {
      id: 'm2',
      asset: '/images/avatars/M2.webp',
      gender: 'male',
    },
    {
      id: 'm3',
      asset: '/images/avatars/M3.webp',
      gender: 'male',
    },
    {
      id: 'm4',
      asset: '/images/avatars/M4.webp',
      gender: 'male',
    },
    {
      id: 'm5',
      asset: '/images/avatars/M5.webp',
      gender: 'male',
    },
  ];

  const femaleCharacters: AvatarOption[] = [
    {
      id: 'f1',
      asset: '/images/avatars/F1.webp',
      gender: 'female',
    },
    {
      id: 'f2',
      asset: '/images/avatars/F2.webp',
      gender: 'female',
    },
    {
      id: 'f3',
      asset: '/images/avatars/F3.webp',
      gender: 'female',
    },
    {
      id: 'f4',
      asset: '/images/avatars/F4.webp',
      gender: 'female',
    },
    {
      id: 'f5',
      asset: '/images/avatars/F5.webp',
      gender: 'female',
    },
  ];

  /* =========================================
     MASCOT STATE
  ========================================= */

  const [idleAnimation, setIdleAnimation] =
    useState<any>(null);

  const [writingAnimation, setWritingAnimation] =
    useState<any>(null);

  const [isWriting, setIsWriting] =
    useState(false);

  const writingLottieRef =
    useRef<LottieRefCurrentProps>(null);

  const previousAvatar =
    useRef<string | null>(null);

  /* =========================================
     LOAD ANIMATIONS
  ========================================= */

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

  /* =========================================
     AVATAR SELECTION → PLAY WRITING
  ========================================= */

  useEffect(() => {
    /*
     * Don't play anything on initial render.
     */
    if (
      selectedAvatar ===
      previousAvatar.current
    ) {
      return;
    }

    const previous =
      previousAvatar.current;

    previousAvatar.current =
      selectedAvatar;

    /*
     * Only play writing when an avatar
     * actually gets selected.
     *
     * Selecting null (unselecting) does
     * not trigger the writing animation.
     */
    if (
      selectedAvatar &&
      selectedAvatar !== previous
    ) {
      setIsWriting(true);

      /*
       * Wait for the writing Lottie to
       * render, then start from frame 0.
       */
      requestAnimationFrame(() => {
        writingLottieRef.current?.goToAndPlay(
          0,
          true
        );
      });
    }
  }, [selectedAvatar]);

  /* =========================================
     WRITING ANIMATION FINISHED
  ========================================= */

  const handleWritingComplete = () => {
    /*
     * Return to idle after writing
     * animation finishes.
     */
    setIsWriting(false);
  };

  return (
    <div className="
      h-full
      min-h-0
      w-full
      max-w-md
      mx-auto
      overflow-hidden
      flex
      flex-col
      text-white
      animate-fade-in
    ">
      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <div className="
        flex-1
        min-h-0
        flex
        flex-col
        justify-center
        overflow-hidden
      ">
        {/* =========================================
            MASCOT + TITLE
        ========================================= */}

        <div className="
          px-5
          sm:px-6
          mb-5
          sm:mb-7
        ">
          <div className="
            flex
            items-center
            justify-center
            gap-3
            sm:gap-5
          ">
            {/* =====================================
                MASCOT — LEFT
            ===================================== */}

            <div className="
              shrink-0
              w-[120px]
              h-[120px]
              sm:w-[145px]
              sm:h-[145px]
              lg:w-[155px]
              lg:h-[155px]
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

            {/* =====================================
                TITLE + SUBTITLE
            ===================================== */}

            <div className="
              flex-1
              min-w-0
              text-left
            ">
              <p className="
                text-xs
                sm:text-sm
                font-medium
                text-slate-400
                mb-1.5
              ">
                Before we start playing....
              </p>

              <h2 className="
                text-[26px]
                sm:text-[32px]
                font-black
                leading-tight
                tracking-tight
                whitespace-nowrap
              ">
                Choose Your Avatar.
              </h2>

              {/* SUBTITLE DIRECTLY UNDER TITLE */}
              <p className="
                text-xs
                sm:text-sm
                text-slate-500
                mt-2
              ">
                Pick one that feels like you.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================
            AVATAR GROUPS
        ========================================= */}

        <div className="
          flex
          flex-col
          gap-4
          sm:gap-6
        ">
          <AvatarCarousel
            title="Male"
            characters={maleCharacters}
            selectedAvatar={selectedAvatar}
            onSelect={onSelect}
            showHint
          />

          <AvatarCarousel
            title="Female"
            characters={femaleCharacters}
            selectedAvatar={selectedAvatar}
            onSelect={onSelect}
          />
        </div>

        {/* =========================================
            DESCRIPTION
        ========================================= */}

        <div className="
          px-6
          text-center
          mt-4
          sm:mt-6
        ">
          <p className="
            text-[10px]
            sm:text-xs
            text-slate-500
            leading-relaxed
            max-w-xs
            mx-auto
          ">
            Your avatar will represent you as you
            play, discover, and level up through
            daily challenges.
          </p>
        </div>
      </div>

      {/* =========================================
          BOTTOM CONTROLS
      ========================================= */}

      <div className="
        shrink-0
        w-full
        px-5
        sm:px-6
        pt-3
        sm:pt-5
        pb-1
        sm:pb-2
      ">
        {/* CONTINUE */}
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedAvatar}
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
          Continue
        </button>

        {/* GO BACK */}
        <button
          type="button"
          onClick={onBack}
          className="
            w-full
            text-slate-400
            font-bold
            py-2
            sm:py-1
            uppercase
            text-[10px]
            sm:text-xs
            tracking-wider
            text-center
            hover:text-white
            transition-colors
          "
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

