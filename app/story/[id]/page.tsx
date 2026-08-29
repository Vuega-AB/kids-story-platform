"use client";

import { MOCK_STORIES } from "@/lib/mock-data";
import { use, useEffect, useRef, useState, forwardRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Sparkles,
  Rocket,
  Moon,
  Star,
} from "lucide-react";
import Link from "next/link";
import HTMLFlipBook from "react-pageflip";

// ============================================================
// TYPES
// ============================================================

type StoryPageProps = {
  children: React.ReactNode;
};

// ============================================================
// FLOATING SPACE DECORATION
// ============================================================

function SpaceDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* ====================================================== */}
      {/* STARS */}
      {/* ====================================================== */}

      <div className="absolute left-[7%] top-[15%] animate-pulse text-yellow-200/90">
        <Star size={22} fill="currentColor" />
      </div>

      <div className="absolute left-[16%] top-[32%] text-white/80">
        <Sparkles size={18} />
      </div>

      <div className="absolute left-[5%] bottom-[23%] animate-pulse text-yellow-300/90">
        <Star size={27} fill="currentColor" />
      </div>

      <div className="absolute left-[22%] bottom-[12%] text-purple-200/80">
        <Sparkles size={25} />
      </div>

      <div className="absolute right-[8%] top-[16%] animate-pulse text-yellow-200/90">
        <Star size={25} fill="currentColor" />
      </div>

      <div className="absolute right-[17%] top-[35%] text-white/80">
        <Sparkles size={19} />
      </div>

      <div className="absolute right-[6%] bottom-[22%] animate-pulse text-yellow-300/90">
        <Star size={30} fill="currentColor" />
      </div>

      <div className="absolute right-[23%] bottom-[11%] text-pink-200/70">
        <Sparkles size={21} />
      </div>

      {/* Small stars */}
      <span className="absolute left-[12%] top-[55%] text-xl text-white/70">
        ✦
      </span>

      <span className="absolute left-[27%] top-[18%] text-sm text-yellow-200/70">
        ✦
      </span>

      <span className="absolute right-[28%] top-[20%] text-sm text-white/70">
        ✦
      </span>

      <span className="absolute right-[12%] top-[55%] text-xl text-yellow-200/70">
        ✦
      </span>

      <span className="absolute left-[32%] bottom-[18%] text-sm text-white/60">
        ✦
      </span>

      <span className="absolute right-[34%] bottom-[17%] text-sm text-white/60">
        ✦
      </span>

      {/* ====================================================== */}
      {/* PLANETS */}
      {/* ====================================================== */}

      {/* Small purple planet - top left */}
      <div
        className="
          absolute
          -left-10
          top-[17%]
          h-24
          w-24
          rounded-full
          bg-gradient-to-br
          from-violet-300
          via-purple-500
          to-indigo-700
          opacity-80
          shadow-[0_0_35px_rgba(139,92,246,0.35)]
        "
      >
        <div
          className="
            absolute
            -right-7
            top-8
            h-4
            w-36
            rotate-[-15deg]
            rounded-full
            border-[5px]
            border-pink-200/50
          "
        />
      </div>

      {/* Small yellow planet - top right */}
      <div
        className="
          absolute
          -right-7
          top-[26%]
          h-20
          w-20
          rounded-full
          bg-gradient-to-br
          from-yellow-200
          via-orange-300
          to-orange-500
          opacity-80
          shadow-[0_0_35px_rgba(251,191,36,0.30)]
        "
      />

      {/* ====================================================== */}
      {/* MOON */}
      {/* ====================================================== */}

      <div
        className="
          absolute
          left-[8%]
          top-[7%]
          hidden
          h-16
          w-16
          rounded-full
          bg-gradient-to-br
          from-yellow-100
          to-yellow-300
          shadow-[0_0_40px_rgba(253,224,71,0.25)]
          sm:block
        "
      >
        <div className="absolute left-3 top-4 h-3 w-3 rounded-full bg-yellow-400/30" />
        <div className="absolute right-4 top-8 h-2 w-2 rounded-full bg-yellow-400/30" />
        <div className="absolute bottom-4 left-7 h-2 w-2 rounded-full bg-yellow-400/30" />
      </div>

      {/* ====================================================== */}
      {/* ROCKET */}
      {/* ====================================================== */}

      <div
        className="
          absolute
          bottom-[13%]
          left-[7%]
          hidden
          rotate-[-18deg]
          text-orange-300/80
          sm:block
        "
      >
        <Rocket size={48} strokeWidth={1.7} />

        {/* Rocket flame */}
        <div
          className="
            absolute
            -bottom-7
            left-4
            h-8
            w-4
            rounded-b-full
            bg-gradient-to-b
            from-yellow-300
            via-orange-400
            to-transparent
            blur-[1px]
          "
        />
      </div>

      {/* ====================================================== */}
      {/* LITTLE CLOUDS */}
      {/* ====================================================== */}

      <div className="absolute right-[8%] bottom-[9%] hidden opacity-40 sm:block">
        <div className="relative h-12 w-28">
          <div className="absolute bottom-0 left-3 h-7 w-20 rounded-full bg-white" />
          <div className="absolute bottom-3 left-7 h-9 w-9 rounded-full bg-white" />
          <div className="absolute bottom-2 right-4 h-7 w-7 rounded-full bg-white" />
        </div>
      </div>

      {/* ====================================================== */}
      {/* GLOW ORBS */}
      {/* ====================================================== */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-[650px]
          w-[900px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-purple-500/[0.08]
          blur-[100px]
        "
      />

      <div
        className="
          absolute
          left-[15%]
          top-[45%]
          h-32
          w-32
          rounded-full
          bg-blue-400/[0.06]
          blur-[50px]
        "
      />

      <div
        className="
          absolute
          right-[12%]
          top-[42%]
          h-40
          w-40
          rounded-full
          bg-pink-400/[0.06]
          blur-[60px]
        "
      />
    </div>
  );
}

// ============================================================
// STORY PAGE
// ============================================================

const StoryPage = forwardRef<HTMLDivElement, StoryPageProps>(
  ({ children }, ref) => {
    return (
      <div
        ref={ref}
        data-density="soft"
        className="
          relative
          h-full
          w-full
          overflow-hidden
          border
          border-[#eadfcf]
          bg-[#fffdf7]
        "
      >
        {/* Paper texture */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-0
            opacity-[0.035]
            bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]
          "
        />

        {/* Warm paper lighting */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-0
            bg-gradient-to-br
            from-white/90
            via-transparent
            to-[#d8c9ad]/15
          "
        />

        {children}
      </div>
    );
  }
);

StoryPage.displayName = "StoryPage";

// ============================================================
// FRONT COVER
// ============================================================

const FrontCover = forwardRef<HTMLDivElement, { story: any }>(
  ({ story }, ref) => {
    return (
      <div
        ref={ref}
        data-density="hard"
        className="
          relative
          h-full
          w-full
          overflow-hidden
          rounded-r-[20px]
          bg-gradient-to-br
          from-[#6d5dfc]
          via-[#5546d9]
          to-[#30258f]
          text-white
        "
      >
        {/* Cute cover glow */}
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-64
            w-64
            rounded-full
            bg-pink-300/20
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20
            -left-20
            h-64
            w-64
            rounded-full
            bg-cyan-300/20
            blur-3xl
          "
        />

        {/* Cover stars */}
        <div className="absolute left-8 top-8 text-yellow-200">
          ✦
        </div>

        <div className="absolute right-10 top-12 text-yellow-100">
          ⭐
        </div>

        <div className="absolute bottom-10 left-10 text-white/80">
          ✨
        </div>

        <div className="absolute bottom-16 right-12 text-yellow-200">
          ✦
        </div>

        {/* Spine */}
        <div
          className="
            absolute
            left-0
            top-0
            bottom-0
            z-30
            w-[14px]
            bg-gradient-to-r
            from-black/25
            via-black/10
            to-transparent
          "
        />

        {/* Decorative border */}
        <div
          className="
            pointer-events-none
            absolute
            inset-[12px]
            rounded-[14px]
            border-2
            border-white/25
          "
        />

        <div
          className="
            relative
            z-10
            flex
            h-full
            flex-col
            items-center
            justify-center
            px-8
            py-10
          "
        >
          {/* Story badge */}
          <div
            className="
              mb-5
              flex
              items-center
              gap-2
              rounded-full
              border
              border-white/20
              bg-white/10
              px-4
              py-2
              text-[10px]
              font-black
              uppercase
              tracking-[0.2em]
              text-purple-100
              backdrop-blur-sm
            "
          >
            <Sparkles size={13} />
            Space Adventure
          </div>

          {/* Cover image */}
          <div
            className="
              relative
              w-[84%]
              overflow-hidden
              rounded-[18px]
              border-[5px]
              border-white/70
              bg-black/10
              shadow-[0_20px_45px_rgba(0,0,0,0.30)]
            "
          >
            <div className="aspect-[4/3]">
              <img
                src={story.coverImage}
                alt={story.title}
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Image shine */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-br
                from-white/25
                via-transparent
                to-black/15
              "
            />
          </div>

          {/* Title */}
          <h1
            className="
              mt-7
              max-w-[92%]
              text-center
              text-4xl
              font-black
              leading-[1.05]
              tracking-tight
              drop-shadow-[0_4px_5px_rgba(0,0,0,0.22)]
            "
          >
            {story.title}
          </h1>

          {/* Stars divider */}
          <div className="mt-4 flex items-center gap-3 text-yellow-200">
            <span className="text-sm">✦</span>
            <span className="text-lg">⭐</span>
            <span className="text-sm">✦</span>
          </div>

          {/* Author */}
          <p
            className="
              mt-3
              text-xs
              font-bold
              uppercase
              tracking-[0.22em]
              text-purple-100
            "
          >
            {story.author}
          </p>
        </div>
      </div>
    );
  }
);

FrontCover.displayName = "FrontCover";

// ============================================================
// BACK COVER
// ============================================================

const BackCover = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      data-density="hard"
      className="
        relative
        h-full
        w-full
        overflow-hidden
        rounded-l-[20px]
        bg-gradient-to-br
        from-[#5040c9]
        via-[#3d31a0]
        to-[#251d6d]
        text-white
      "
    >
      {/* Decorative stars */}
      <div className="absolute left-10 top-12 text-yellow-200">
        ✦
      </div>

      <div className="absolute right-12 top-20 text-white/80">
        ✨
      </div>

      <div className="absolute left-16 bottom-20 text-yellow-100">
        ⭐
      </div>

      <div className="absolute right-10 bottom-12 text-purple-200">
        ✦
      </div>

      {/* Glow */}
      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-72
          w-72
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-purple-300/10
          blur-3xl
        "
      />

      {/* Spine */}
      <div
        className="
          absolute
          right-0
          top-0
          bottom-0
          z-20
          w-[14px]
          bg-gradient-to-l
          from-black/25
          via-black/10
          to-transparent
        "
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        {/* Cute planet */}
        <div
          className="
            relative
            flex
            h-28
            w-28
            items-center
            justify-center
            rounded-full
            bg-gradient-to-br
            from-yellow-200
            via-orange-300
            to-orange-500
            shadow-[0_0_45px_rgba(251,191,36,0.25)]
          "
        >
          <div
            className="
              absolute
              -left-8
              top-12
              h-5
              w-44
              rotate-[-12deg]
              rounded-full
              border-[5px]
              border-yellow-100/50
            "
          />

          <Star
            size={32}
            fill="currentColor"
            className="text-white/80"
          />
        </div>

        <p
          className="
            mt-8
            text-3xl
            font-black
            tracking-tight
            text-white
          "
        >
          The End!
        </p>

        <div className="mt-4 flex gap-2 text-yellow-200">
          <span>✦</span>
          <span>⭐</span>
          <span>✦</span>
        </div>

        <p className="mt-5 text-sm font-semibold text-purple-100/70">
          Until the next adventure...
        </p>
      </div>
    </div>
  );
});

BackCover.displayName = "BackCover";

// ============================================================
// MAIN READER
// ============================================================

export default function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const story = MOCK_STORIES.find((s) => s.id === id);

  const bookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [bookSize, setBookSize] = useState({
    width: 560,
    height: 720,
  });

  // ============================================================
  // RESPONSIVE BOOK SIZE
  // ============================================================

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const mobile = width < 768;

      setIsMobile(mobile);

      if (mobile) {
        const pageWidth = Math.min(width - 24, 430);

        const pageHeight = Math.min(
          height - 145,
          650
        );

        setBookSize({
          width: Math.floor(pageWidth),
          height: Math.floor(pageHeight),
        });
      } else {
        const availableWidth = width - 90;
        const availableHeight = height - 150;

        const aspectRatio = 0.78;

        let heightValue = Math.min(
          availableHeight,
          760
        );

        let widthValue =
          heightValue * aspectRatio;

        if (widthValue * 2 > availableWidth) {
          widthValue = availableWidth / 2;
          heightValue =
            widthValue / aspectRatio;
        }

        setBookSize({
          width: Math.max(
            400,
            Math.floor(widthValue)
          ),
          height: Math.max(
            520,
            Math.floor(heightValue)
          ),
        });
      }
    };

    updateSize();

    window.addEventListener(
      "resize",
      updateSize
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateSize
      );
    };
  }, []);

  // ============================================================
  // PAGE SOUND
  // ============================================================

  const playPageSound = () => {
    if (!soundEnabled) return;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(
          "/sounds/page-flip.mp3"
        );
      }

      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.18;

      audioRef.current
        .play()
        .catch(() => {});
    } catch {
      // Ignore audio errors
    }
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const nextPage = () => {
    if (!bookRef.current) return;

    playPageSound();

    bookRef.current
      .pageFlip()
      .flipNext();
  };

  const previousPage = () => {
    if (!bookRef.current) return;

    playPageSound();

    bookRef.current
      .pageFlip()
      .flipPrev();
  };

  // ============================================================
  // KEYBOARD
  // ============================================================

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "ArrowRight") {
        nextPage();
      }

      if (event.key === "ArrowLeft") {
        previousPage();
      }

      if (event.key === "Escape") {
        window.history.back();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // ============================================================
  // TOUCH SWIPE
  // ============================================================

  const touchStartX =
    useRef<number | null>(null);

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    touchStartX.current =
      event.touches[0].clientX;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (
      touchStartX.current === null
    ) {
      return;
    }

    const endX =
      event.changedTouches[0].clientX;

    const difference =
      touchStartX.current - endX;

    touchStartX.current = null;

    if (difference > 45) {
      nextPage();
    }

    if (difference < -45) {
      previousPage();
    }
  };

  // ============================================================
  // STORY NOT FOUND
  // ============================================================

  if (!story) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#17133f]
        "
      >
        <div className="text-center text-white">
          <div className="mb-4 text-5xl">
            🚀
          </div>

          <h1 className="text-3xl font-black">
            Story not found
          </h1>

          <Link
            href="/"
            className="
              mt-5
              inline-block
              rounded-full
              bg-purple-500
              px-6
              py-3
              font-bold
              text-white
              transition
              hover:bg-purple-400
            "
          >
            Go back
          </Link>
        </div>
      </main>
    );
  }

  // ============================================================
  // PROGRESS
  // ============================================================

  const totalPages =
    story.pages.length + 1;

  const progress =
    totalPages > 0
      ? Math.min(
          100,
          (currentPage / totalPages) * 100
        )
      : 0;

  // ============================================================
  // UI
  // ============================================================

  return (
    <main
      className="
        fixed
        inset-0
        z-[100]
        flex
        flex-col
        overflow-hidden
        bg-gradient-to-b
        from-[#161044]
        via-[#21175c]
        to-[#110d35]
        select-none
      "
    >
      {/* ====================================================== */}
      {/* SPACE BACKGROUND */}
      {/* ====================================================== */}

      <SpaceDecorations />

      {/* Extra tiny stars */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
        <div className="absolute left-[35%] top-[8%] text-xs text-white">
          ✦
        </div>

        <div className="absolute left-[44%] top-[14%] text-sm text-yellow-200">
          ·
        </div>

        <div className="absolute right-[38%] top-[9%] text-xs text-white">
          ✦
        </div>

        <div className="absolute left-[40%] bottom-[8%] text-xs text-white">
          ✦
        </div>

        <div className="absolute right-[42%] bottom-[12%] text-sm text-yellow-200">
          ·
        </div>
      </div>

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <header
        className="
          absolute
          left-0
          right-0
          top-0
          z-[200]
          flex
          items-center
          justify-between
          px-4
          py-4
          sm:px-7
          sm:py-5
        "
      >
        {/* Story title */}
        <div
          className="
            flex
            items-center
            gap-3
            rounded-full
            border-2
            border-white/15
            bg-[#31266f]/75
            px-4
            py-2.5
            text-white
            shadow-[0_8px_25px_rgba(0,0,0,0.20)]
            backdrop-blur-md
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-yellow-300
              text-purple-900
              shadow-sm
            "
          >
            <Star
              size={16}
              fill="currentColor"
            />
          </div>

          <h2
            className="
              max-w-[180px]
              truncate
              text-sm
              font-black
              sm:max-w-[320px]
              sm:text-base
            "
          >
            {story.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound */}
          <button
            onClick={() =>
              setSoundEnabled(
                (value) => !value
              )
            }
            aria-label="Toggle sound"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border-2
              border-white/15
              bg-[#31266f]/75
              text-white
              shadow-[0_8px_20px_rgba(0,0,0,0.18)]
              backdrop-blur-md
              transition-all
              hover:scale-105
              hover:bg-[#40338b]
              active:scale-90
            "
          >
            {soundEnabled ? (
              <Volume2 size={19} />
            ) : (
              <VolumeX size={19} />
            )}
          </button>

          {/* Close */}
          <Link href="/">
            <button
              aria-label="Close"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border-2
                border-white/20
                bg-pink-500
                text-white
                shadow-[0_8px_20px_rgba(236,72,153,0.25)]
                transition-all
                hover:scale-105
                hover:bg-pink-400
                active:scale-90
              "
            >
              <X size={21} />
            </button>
          </Link>
        </div>
      </header>

      {/* ====================================================== */}
      {/* BOOK AREA */}
      {/* ====================================================== */}

      <div
        className="
          relative
          z-10
          flex
          min-h-0
          flex-1
          items-center
          justify-center
          px-3
          pb-20
          pt-20
        "
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Book glow */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[70%]
            w-[70%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-purple-400/[0.10]
            blur-[90px]
          "
        />

        {/* Book shadow */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[68%]
            w-[65%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-[50%]
            bg-black/45
            blur-[50px]
          "
        />

        {/* ================================================== */}
        {/* BOOK */}
        {/* ================================================== */}

        <div
          className="
            relative
            z-20
            flex
            items-center
            justify-center
          "
        >
          {/* @ts-ignore */}
          <HTMLFlipBook
            ref={bookRef}
            width={bookSize.width}
            height={bookSize.height}
            size="fixed"
            minWidth={280}
            maxWidth={700}
            minHeight={400}
            maxHeight={850}
            showCover={true}
            usePortrait={isMobile}
            mobileScrollSupport={false}
            useMouseEvents={true}
            drawShadow={true}
            maxShadowOpacity={0.42}
            flippingTime={650}
            startPage={0}
            startZIndex={0}
            autoSize={false}
            clickEventForward={true}
            swipeDistance={15}
            showPageCorners={true}
            disableFlipByClick={false}
            onFlip={(event: any) => {
              setCurrentPage(event.data);
            }}
            className="
              story-book
              rounded-[20px]
              shadow-[0_30px_70px_rgba(0,0,0,0.40)]
            "
          >
            {/* ================================================== */}
            {/* FRONT COVER */}
            {/* ================================================== */}

            <FrontCover story={story} />

            {/* ================================================== */}
            {/* STORY PAGES */}
            {/* ================================================== */}

            {story.pages.map(
              (
                page: any,
                index: number
              ) => {
                const isLeft =
                  index % 2 === 0;

                return (
                  <StoryPage
                    key={page.id}
                  >
                    {/* Center fold */}
                    <div
                      className={`
                        pointer-events-none
                        absolute
                        top-0
                        bottom-0
                        z-40
                        w-[55px]
                        ${
                          isLeft
                            ? "right-0 bg-gradient-to-l from-black/[0.13] via-black/[0.035] to-transparent"
                            : "left-0 bg-gradient-to-r from-black/[0.13] via-black/[0.035] to-transparent"
                        }
                      `}
                    />

                    {/* Page edge light */}
                    <div
                      className={`
                        pointer-events-none
                        absolute
                        top-0
                        bottom-0
                        z-30
                        w-5
                        ${
                          isLeft
                            ? "left-0 bg-gradient-to-r from-white/40 to-transparent"
                            : "right-0 bg-gradient-to-l from-white/40 to-transparent"
                        }
                      `}
                    />

                    {/* Content */}
                    <div
                      className="
                        relative
                        z-10
                        flex
                        h-full
                        flex-col
                        p-7
                        sm:p-9
                        md:p-10
                      "
                    >
                      {/* IMAGE */}
                      <div
                        className="
                          relative
                          h-[55%]
                          w-full
                          overflow-hidden
                          rounded-[18px]
                          border-[5px]
                          border-white
                          bg-[#eee7db]
                          shadow-[0_10px_25px_rgba(0,0,0,0.12)]
                        "
                      >
                        <img
                          src={
                            page.imageUrl
                          }
                          alt=""
                          draggable={false}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />

                        {/* Image highlight */}
                        <div
                          className="
                            pointer-events-none
                            absolute
                            inset-0
                            bg-gradient-to-br
                            from-white/20
                            via-transparent
                            to-black/[0.08]
                          "
                        />

                        {/* Tiny sparkle */}
                        <div
                          className="
                            pointer-events-none
                            absolute
                            right-3
                            top-3
                            text-white/80
                            drop-shadow
                          "
                        >
                          ✦
                        </div>
                      </div>

                      {/* TEXT */}
                      <div
                        className="
                          flex
                          flex-1
                          flex-col
                          items-center
                          justify-center
                          px-2
                        "
                      >
                        <p
                          className="
                            max-w-[95%]
                            text-center
                            font-serif
                            text-[23px]
                            font-medium
                            leading-[1.45]
                            text-[#27364d]
                            sm:text-[27px]
                            md:text-[30px]
                          "
                        >
                          {page.text}
                        </p>

                        {/* Cute decoration */}
                        <div className="mt-5 flex items-center gap-2">
                          <span className="h-[2px] w-8 rounded-full bg-purple-200" />

                          <span className="text-sm text-yellow-400">
                            ⭐
                          </span>

                          <span className="h-[2px] w-8 rounded-full bg-purple-200" />
                        </div>
                      </div>

                      {/* Page number */}
                      <div
                        className="
                          absolute
                          bottom-4
                          left-1/2
                          -translate-x-1/2
                          rounded-full
                          bg-purple-50
                          px-3
                          py-1
                          text-[10px]
                          font-black
                          tracking-[0.2em]
                          text-purple-300
                        "
                      >
                        {index + 1}
                      </div>
                    </div>
                  </StoryPage>
                );
              }
            )}

            {/* ================================================== */}
            {/* BACK COVER */}
            {/* ================================================== */}

            <BackCover />
          </HTMLFlipBook>
        </div>

        {/* ==================================================== */}
        {/* DESKTOP SIDE NAVIGATION */}
        {/* ==================================================== */}

        {!isMobile && (
          <>
            <button
              onClick={(event) => {
                event.stopPropagation();
                previousPage();
              }}
              aria-label="Previous page"
              className="
                group
                absolute
                left-2
                top-1/2
                z-[100]
                flex
                h-[70%]
                w-[13%]
                -translate-y-1/2
                cursor-pointer
                items-center
                justify-start
                bg-transparent
                pl-2
              "
            >
              <span
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-white/10
                  bg-[#31266f]/50
                  text-white/60
                  opacity-0
                  backdrop-blur-sm
                  transition-all
                  group-hover:scale-110
                  group-hover:opacity-100
                "
              >
                <ChevronLeft size={25} />
              </span>
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();
                nextPage();
              }}
              aria-label="Next page"
              className="
                group
                absolute
                right-2
                top-1/2
                z-[100]
                flex
                h-[70%]
                w-[13%]
                -translate-y-1/2
                cursor-pointer
                items-center
                justify-end
                bg-transparent
                pr-2
              "
            >
              <span
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-white/10
                  bg-[#31266f]/50
                  text-white/60
                  opacity-0
                  backdrop-blur-sm
                  transition-all
                  group-hover:scale-110
                  group-hover:opacity-100
                "
              >
                <ChevronRight size={25} />
              </span>
            </button>
          </>
        )}
      </div>

      {/* ====================================================== */}
      {/* BOTTOM CONTROLS */}
      {/* ====================================================== */}

      <div
        className="
          absolute
          bottom-4
          left-1/2
          z-[200]
          flex
          -translate-x-1/2
          items-center
          gap-3
          sm:bottom-5
          sm:gap-5
        "
      >
        {/* Previous */}
        <button
          onClick={previousPage}
          aria-label="Previous page"
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border-2
            border-white/15
            bg-[#31266f]/80
            text-white
            shadow-[0_6px_20px_rgba(0,0,0,0.20)]
            backdrop-blur-md
            transition-all
            hover:scale-110
            hover:bg-[#40338b]
            active:scale-90
          "
        >
          <ChevronLeft size={23} />
        </button>

        {/* Progress */}
        <div
          className="
            rounded-full
            border
            border-white/10
            bg-[#31266f]/75
            px-4
            py-2
            shadow-[0_6px_20px_rgba(0,0,0,0.18)]
            backdrop-blur-md
            sm:px-5
          "
        >
          <div className="w-28 sm:w-44">
            <div
              className="
                h-[6px]
                overflow-hidden
                rounded-full
                bg-white/15
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-yellow-300
                  via-orange-300
                  to-pink-300
                  transition-all
                  duration-500
                "
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div
              className="
                mt-1
                text-center
                text-[9px]
                font-black
                uppercase
                tracking-[0.2em]
                text-white/60
              "
            >
              {currentPage === 0
                ? "Ready for takeoff! 🚀"
                : currentPage >=
                  totalPages - 1
                ? "The End ⭐"
                : `Page ${currentPage} ✦`}
            </div>
          </div>
        </div>

        {/* Next */}
        <button
          onClick={nextPage}
          aria-label="Next page"
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border-2
            border-yellow-200/30
            bg-gradient-to-br
            from-yellow-300
            to-orange-400
            text-purple-900
            shadow-[0_6px_25px_rgba(251,191,36,0.30)]
            transition-all
            hover:scale-110
            hover:from-yellow-200
            hover:to-orange-300
            active:scale-90
          "
        >
          <ChevronRight size={23} />
        </button>
      </div>

      {/* ====================================================== */}
      {/* MOBILE HINT */}
      {/* ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-[72px]
          left-1/2
          z-[150]
          -translate-x-1/2
          whitespace-nowrap
          rounded-full
          border
          border-white/10
          bg-[#31266f]/50
          px-4
          py-1.5
          text-[9px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-white/50
          backdrop-blur-sm
          sm:hidden
        "
      >
        ✨ Swipe to explore ✨
      </div>
    </main>
  );
}
