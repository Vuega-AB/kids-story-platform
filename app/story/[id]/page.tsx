"use client";

import {
  getStory,
  saveReadingProgress,
  getFavorites,
  toggleFavorite,
} from "@/lib/store";
import { Story } from "@/types/story";
import { use, useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Sparkles,
  Rocket,
  Star,
  Heart,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

// Dynamic import with ssr: false prevents build errors and SSR window crashes with react-pageflip
const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
}) as any;

type StoryPageProps = {
  children: React.ReactNode;
};

/* -------------------------------------------------------
   TEXT HELPERS
------------------------------------------------------- */

function splitTextIntoPages(
  text: string,
  maxFirstPageChars = 260,
  maxContinuationChars = 520
): string[] {
  const clean = text.trim().replace(/\s+/g, " ");

  if (!clean) return [""];
  if (clean.length <= maxFirstPageChars) return [clean];

  const sentenceMatches =
    clean.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [clean];

  const chunks: string[] = [];
  let currentChunk = "";
  let firstChunk = true;

  for (const sentenceRaw of sentenceMatches) {
    const sentence = sentenceRaw.trim();
    const limit = firstChunk ? maxFirstPageChars : maxContinuationChars;
    const candidate = currentChunk ? `${currentChunk} ${sentence}` : sentence;

    if (candidate.length <= limit) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
      firstChunk = false;
    }

    const newLimit = firstChunk ? maxFirstPageChars : maxContinuationChars;

    if (sentence.length <= newLimit) {
      currentChunk = sentence;
      continue;
    }

    const words = sentence.split(" ");
    let wordChunk = "";

    for (const word of words) {
      const candidateWord = wordChunk ? `${wordChunk} ${word}` : word;
      if (candidateWord.length <= newLimit) {
        wordChunk = candidateWord;
      } else {
        if (wordChunk) {
          chunks.push(wordChunk.trim());
          firstChunk = false;
        }
        wordChunk = word;
      }
    }

    currentChunk = wordChunk;
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length ? chunks : [clean];
}

/* -------------------------------------------------------
   BACKGROUND DECORATIONS
------------------------------------------------------- */

function SpaceDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute left-[7%] top-[15%] animate-pulse text-yellow-200/90">
        <Star size={22} fill="currentColor" />
      </div>

      <div className="absolute left-[16%] top-[32%] text-white/80">
        <Sparkles size={18} />
      </div>

      <div className="absolute bottom-[23%] left-[5%] animate-pulse text-yellow-300/90">
        <Star size={27} fill="currentColor" />
      </div>

      <div className="absolute bottom-[12%] left-[22%] text-purple-200/80">
        <Sparkles size={25} />
      </div>

      <div className="absolute right-[8%] top-[16%] animate-pulse text-yellow-200/90">
        <Star size={25} fill="currentColor" />
      </div>

      <div className="absolute right-[17%] top-[35%] text-white/80">
        <Sparkles size={19} />
      </div>

      <div className="absolute bottom-[22%] right-[6%] animate-pulse text-yellow-300/90">
        <Star size={30} fill="currentColor" />
      </div>

      <div className="absolute bottom-[11%] right-[23%] text-pink-200/70">
        <Sparkles size={21} />
      </div>

      <span className="absolute left-[12%] top-[55%] text-xl text-white/70">✦</span>
      <span className="absolute left-[27%] top-[18%] text-sm text-yellow-200/70">✦</span>
      <span className="absolute right-[28%] top-[20%] text-sm text-white/70">✦</span>
      <span className="absolute right-[12%] top-[55%] text-xl text-yellow-200/70">✦</span>

      <div className="absolute -left-10 top-[17%] h-24 w-24 rounded-full bg-gradient-to-br from-violet-300 via-purple-500 to-indigo-700 opacity-80 shadow-[0_0_35px_rgba(139,92,246,0.35)]">
        <div className="absolute -right-7 top-8 h-4 w-36 rotate-[-15deg] rounded-full border-[5px] border-pink-200/50" />
      </div>

      <div className="absolute -right-7 top-[26%] h-20 w-20 rounded-full bg-gradient-to-br from-yellow-200 via-orange-300 to-orange-500 opacity-80 shadow-[0_0_35px_rgba(251,191,36,0.30)]" />

      <div className="absolute bottom-[13%] left-[7%] hidden rotate-[-18deg] text-orange-300/80 sm:block">
        <Rocket size={48} strokeWidth={1.7} />
        <div className="absolute -bottom-7 left-4 h-8 w-4 rounded-b-full bg-gradient-to-b from-yellow-300 via-orange-400 to-transparent blur-[1px]" />
      </div>

      <div className="absolute left-1/2 top-1/2 h-[650px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/[0.08] blur-[100px]" />
    </div>
  );
}

/* -------------------------------------------------------
   STORY BOOK PAGE
------------------------------------------------------- */

const StoryBookPage = forwardRef<HTMLDivElement, StoryPageProps>(
  ({ children }, ref) => {
    return (
      <div
        ref={ref}
        data-density="soft"
        className="relative h-full w-full overflow-hidden border border-[#eadfcf] bg-[#fffdf7]"
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/90 via-transparent to-[#d8c9ad]/15" />
        {children}
      </div>
    );
  }
);

StoryBookPage.displayName = "StoryBookPage";

/* -------------------------------------------------------
   FRONT COVER
------------------------------------------------------- */

const FrontCover = forwardRef<HTMLDivElement, { story: any }>(
  ({ story }, ref) => {
    return (
      <div
        ref={ref}
        data-density="hard"
        className="relative h-full w-full overflow-hidden rounded-r-[20px] bg-gradient-to-br from-[#6d5dfc] via-[#5546d9] to-[#30258f] text-white"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="absolute left-8 top-8 text-yellow-200">✦</div>
        <div className="absolute right-10 top-12 text-yellow-100">⭐</div>
        <div className="absolute bottom-10 left-10 text-white/80">✨</div>
        <div className="absolute bottom-16 right-12 text-yellow-200">✦</div>

        <div className="absolute bottom-0 left-0 top-0 z-30 w-[14px] bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-[12px] rounded-[14px] border-2 border-white/25" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-8">
          <div className="mb-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-purple-100 backdrop-blur-sm">
            <Sparkles size={13} />
            {story.category || "Adventure"}
          </div>

          <div className="relative w-[80%] max-w-[340px] shrink-0 overflow-hidden rounded-[18px] border-[4px] border-white/70 bg-black/10 shadow-[0_15px_35px_rgba(0,0,0,0.30)]">
            <div className="aspect-[4/3]">
              {story.coverImage ? (
                <img
                  src={story.coverImage}
                  alt={story.title}
                  draggable={false}
                  className="block h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-purple-800/40 text-4xl">
                  🎨
                </div>
              )}
            </div>
          </div>

          <h1 className="mt-5 max-w-[90%] text-center text-2xl font-black leading-tight tracking-tight drop-shadow-[0_4px_5px_rgba(0,0,0,0.22)] sm:text-3xl">
            {story.title}
          </h1>

          <div className="mt-3 flex items-center gap-3 text-yellow-200">
            <span className="text-xs">✦</span>
            <span className="text-base">⭐</span>
            <span className="text-xs">✦</span>
          </div>

          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.22em] text-purple-100">
            By {story.author || "Storyland"}
          </p>
        </div>
      </div>
    );
  }
);

FrontCover.displayName = "FrontCover";

/* -------------------------------------------------------
   BACK COVER
------------------------------------------------------- */

const BackCover = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      data-density="hard"
      className="relative h-full w-full overflow-hidden rounded-l-[20px] bg-gradient-to-br from-[#5040c9] via-[#3d31a0] to-[#251d6d] text-white"
    >
      <div className="absolute left-10 top-12 text-yellow-200">✦</div>
      <div className="absolute right-12 top-20 text-white/80">✨</div>
      <div className="absolute bottom-20 left-16 text-yellow-100">⭐</div>
      <div className="absolute bottom-12 right-10 text-purple-200">✦</div>

      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-300/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 top-0 z-20 w-[14px] bg-gradient-to-l from-black/25 via-black/10 to-transparent" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 via-orange-300 to-orange-500 shadow-[0_0_45px_rgba(251,191,36,0.25)]">
          <Star size={28} fill="currentColor" className="text-white/80" />
        </div>

        <p className="mt-6 text-2xl font-black tracking-tight text-white sm:text-3xl">
          The End!
        </p>

        <div className="mt-3 flex gap-2 text-yellow-200">
          <span>✦</span>
          <span>⭐</span>
          <span>✦</span>
        </div>

        <p className="mt-4 text-xs font-semibold text-purple-100/70">
          Until the next adventure...
        </p>
      </div>
    </div>
  );
});

BackCover.displayName = "BackCover";

/* -------------------------------------------------------
   READER MAIN
------------------------------------------------------- */

export default function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [story, setStory] = useState<Story | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  const bookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [bookSize, setBookSize] = useState({
    width: 520,
    height: 680,
  });

  /* -------------------------------------------------------
     LOAD STORY & FAVORITE ASYNC
  ------------------------------------------------------- */

  useEffect(() => {
    async function loadStory() {
      setLoading(true);
      try {
        const found = await getStory(id);
        setStory(found);

        if (found) {
          const favorites = await getFavorites();
          setFavorite(favorites.includes(found.id));
        }
      } catch (err) {
        console.error("Error loading story:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStory();
  }, [id]);

  /* -------------------------------------------------------
     PREPARE PAGES
  ------------------------------------------------------- */

  const displayPages = useMemo(() => {
    if (!story?.pages || !Array.isArray(story.pages)) {
      return [];
    }

    const pagesList: Array<{
      id: number;
      displayNum: number;
      text: string;
      imageUrl?: string;
      isContinuation: boolean;
    }> = [];

    let counter = 1;

    story.pages.forEach((page: any) => {
      const chunks = splitTextIntoPages(page.text || "", 260, 520);

      chunks.forEach((chunkText, index) => {
        pagesList.push({
          id: page.id,
          displayNum: counter++,
          text: chunkText,
          imageUrl:
            index === 0 && typeof page.imageUrl === "string"
              ? page.imageUrl
              : undefined,
          isContinuation: index > 0,
        });
      });
    });

    return pagesList;
  }, [story]);

  /* -------------------------------------------------------
     RESPONSIVE BOOK SIZE
  ------------------------------------------------------- */

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const mobile = width < 768;
      setIsMobile(mobile);

      if (mobile) {
        const pageWidth = Math.min(width - 24, 430);
        const pageHeight = Math.min(height - 145, 650);

        setBookSize({
          width: Math.floor(pageWidth),
          height: Math.floor(pageHeight),
        });
        return;
      }

      const availableWidth = width - 90;
      const availableHeight = height - 150;
      const aspectRatio = 0.78;

      let heightValue = Math.min(availableHeight, 760);
      let widthValue = heightValue * aspectRatio;

      if (widthValue * 2 > availableWidth) {
        widthValue = availableWidth / 2;
        heightValue = widthValue / aspectRatio;
      }

      setBookSize({
        width: Math.max(400, Math.floor(widthValue)),
        height: Math.max(520, Math.floor(heightValue)),
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  /* -------------------------------------------------------
     SOUND & NAVIGATION
  ------------------------------------------------------- */

  const playPageSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/page-flip.mp3");
      }
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.18;
      audioRef.current.play().catch(() => {});
    } catch {}
  };

  const nextPage = () => {
    if (!bookRef.current) return;
    playPageSound();
    bookRef.current.pageFlip().flipNext();
  };

  const previousPage = () => {
    if (!bookRef.current) return;
    playPageSound();
    bookRef.current.pageFlip().flipPrev();
  };

  const handleFavoriteToggle = async () => {
    if (!story) return;
    const isNowFav = await toggleFavorite(story.id);
    setFavorite(isNowFav);
  };

  /* -------------------------------------------------------
     KEYBOARD CONTROLS
  ------------------------------------------------------- */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") nextPage();
      if (event.key === "ArrowLeft") previousPage();
      if (event.key === "Escape") router.push("/");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  /* -------------------------------------------------------
     TOUCH CONTROLS
  ------------------------------------------------------- */

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const difference = touchStartX.current - endX;
    touchStartX.current = null;

    if (difference > 45) nextPage();
    if (difference < -45) previousPage();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#17133f] text-white font-black">
        <div className="text-center">
          <div className="text-5xl animate-bounce">✨</div>
          <p className="mt-4 text-purple-200">Opening magical story from the cloud...</p>
        </div>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#17133f]">
        <div className="px-6 text-center text-white">
          <div className="mb-4 text-6xl">📚</div>
          <h1 className="text-3xl font-black">Story not found</h1>
          <p className="mt-2 text-purple-200">
            This adventure may have disappeared into the magic clouds.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-500 px-7 py-3 font-black text-white shadow-lg transition hover:bg-purple-400"
          >
            <BookOpen size={18} />
            Back to Storyland
          </Link>
        </div>
      </main>
    );
  }

  const totalPages = displayPages.length + 1;
  const progress =
    totalPages > 0 ? Math.min(100, (currentPage / totalPages) * 100) : 0;

  return (
    <main className="fixed inset-0 z-[100] flex select-none flex-col overflow-hidden bg-gradient-to-b from-[#161044] via-[#21175c] to-[#110d35]">
      <SpaceDecorations />

      {/* HEADER */}
      <header className="absolute left-0 right-0 top-0 z-[200] flex items-center justify-between px-4 py-4 sm:px-7 sm:py-5">
        <div className="flex max-w-[65%] items-center gap-3 rounded-full border-2 border-white/15 bg-[#31266f]/75 px-4 py-2.5 text-white shadow-[0_8px_25px_rgba(0,0,0,0.20)] backdrop-blur-md">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-purple-900 shadow-sm">
            <Star size={16} fill="currentColor" />
          </div>
          <h2 className="truncate text-sm font-black sm:text-base">{story.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            aria-label="Favorite story"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/15 bg-[#31266f]/75 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-90"
          >
            <Heart
              size={19}
              fill={favorite ? "currentColor" : "none"}
              className={favorite ? "text-pink-300" : ""}
            />
          </button>

          <button
            onClick={() => setSoundEnabled((v) => !v)}
            aria-label="Toggle sound"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/15 bg-[#31266f]/75 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-90"
          >
            {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>

          <Link href="/">
            <span
              aria-label="Close story"
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/20 bg-pink-500 text-white shadow-lg transition-all hover:scale-105 active:scale-90"
            >
              <X size={21} />
            </span>
          </Link>
        </div>
      </header>

      {/* BOOK AREA */}
      <div
        className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 pb-20 pt-20"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative z-20 flex items-center justify-center">
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
              saveReadingProgress(story.id, event.data, totalPages);
            }}
            className="story-book rounded-[20px] shadow-[0_30px_70px_rgba(0,0,0,0.40)]"
          >
            <FrontCover story={story} />

            {displayPages.map((page, index) => {
              const isLeft = index % 2 === 0;

              return (
                <StoryBookPage key={`${page.id}-${index}`}>
                  <div
                    className={`pointer-events-none absolute bottom-0 top-0 z-40 w-[45px] ${
                      isLeft
                        ? "right-0 bg-gradient-to-l from-black/[0.12] via-black/[0.03] to-transparent"
                        : "left-0 bg-gradient-to-r from-black/[0.12] via-black/[0.03] to-transparent"
                    }`}
                  />

                  <div className="relative z-10 flex h-full min-h-0 flex-col p-4 pb-9 sm:p-5 md:p-6">
                    {page.imageUrl ? (
                      <>
                        <div className="relative h-[45%] min-h-[190px] w-full shrink-0 overflow-hidden rounded-[15px] border-[3px] border-white bg-[#eee7db] shadow-sm sm:h-[47%]">
                          <img
                            src={page.imageUrl}
                            alt={`Illustration for page ${page.displayNum}`}
                            draggable={false}
                            className="absolute inset-0 block h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-1 py-3">
                          <p className="max-w-[96%] text-center font-serif text-[14px] font-medium leading-[1.5] text-[#27364d] sm:text-[15px] md:text-[16px]">
                            {page.text}
                          </p>
                          <div className="mt-2.5 flex shrink-0 items-center gap-2">
                            <span className="h-[2px] w-5 rounded-full bg-purple-200" />
                            <span className="text-xs text-yellow-400">⭐</span>
                            <span className="h-[2px] w-5 rounded-full bg-purple-200" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-hidden px-4 py-6 text-center">
                        <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff2db] text-[#b4802c]">
                          <Sparkles size={23} />
                        </div>
                        <p className="max-w-[94%] font-serif text-[16px] font-medium leading-[1.65] text-[#27364d] sm:text-[18px] md:text-[20px]">
                          {page.text}
                        </p>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-1/2 z-50 -translate-x-1/2 rounded-full border border-purple-100 bg-purple-50/95 px-3 py-0.5 text-[9px] font-black tracking-[0.2em] text-purple-400">
                      {page.displayNum}
                    </div>
                  </div>
                </StoryBookPage>
              );
            })}

            <BackCover />
          </HTMLFlipBook>
        </div>

        {!isMobile && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                previousPage();
              }}
              aria-label="Previous page"
              className="group absolute left-2 top-1/2 z-[100] flex h-[70%] w-[13%] -translate-y-1/2 cursor-pointer items-center justify-start bg-transparent pl-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/10 bg-[#31266f]/50 text-white/60 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
                <ChevronLeft size={25} />
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPage();
              }}
              aria-label="Next page"
              className="group absolute right-2 top-1/2 z-[100] flex h-[70%] w-[13%] -translate-y-1/2 cursor-pointer items-center justify-end bg-transparent pr-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/10 bg-[#31266f]/50 text-white/60 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
                <ChevronRight size={25} />
              </span>
            </button>
          </>
        )}
      </div>

      {/* BOTTOM PROGRESS BAR */}
      <div className="absolute bottom-4 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-3 sm:bottom-5 sm:gap-5">
        <button
          onClick={previousPage}
          aria-label="Previous page"
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/15 bg-[#31266f]/80 text-white shadow-md backdrop-blur-md transition-all hover:scale-110 active:scale-90"
        >
          <ChevronLeft size={23} />
        </button>

        <div className="rounded-full border border-white/10 bg-[#31266f]/75 px-4 py-2 shadow-md backdrop-blur-md sm:px-5">
          <div className="w-28 sm:w-44">
            <div className="h-[6px] overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-1 text-center text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
              {currentPage === 0
                ? "Ready for takeoff! 🚀"
                : currentPage >= totalPages - 1
                ? "The End ⭐"
                : `Page ${currentPage} ✦`}
            </div>
          </div>
        </div>

        <button
          onClick={nextPage}
          aria-label="Next page"
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-yellow-200/30 bg-gradient-to-br from-yellow-300 to-orange-400 text-purple-900 shadow-md transition-all hover:scale-110 active:scale-90"
        >
          <ChevronRight size={23} />
        </button>
      </div>
    </main>
  );
}