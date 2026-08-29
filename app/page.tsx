"use client";

import { MOCK_STORIES } from "@/lib/mock-data";
import Link from "next/link";
import {
  Star,
  Sparkles,
  Rocket,
  BookOpen,
  ArrowRight,
} from "lucide-react";

// ============================================================
// CUTE BACKGROUND
// ============================================================

function KidsBackground() {
  return (
    <>
      {/* Sky */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
          bg-[#8ed8f8]
        "
      >
        {/* Soft sky circles */}
        <div
          className="
            absolute
            -left-32
            top-20
            h-96
            w-96
            rounded-full
            bg-[#a9e5ff]
          "
        />

        <div
          className="
            absolute
            -right-40
            top-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-[#78cbed]
          "
        />

        {/* ================================================== */}
        {/* SUN */}
        {/* ================================================== */}

        <div
          className="
            absolute
            right-[7%]
            top-12
            h-28
            w-28
            rounded-full
            bg-[#ffe77a]
            shadow-[0_0_0_12px_rgba(255,231,122,0.18)]
          "
        >
          <div className="absolute left-7 top-7 h-3 w-3 rounded-full bg-[#e7b94c]/40" />
          <div className="absolute right-7 top-10 h-4 w-4 rounded-full bg-[#e7b94c]/30" />
          <div className="absolute bottom-7 left-10 h-3 w-3 rounded-full bg-[#e7b94c]/30" />
        </div>

        {/* ================================================== */}
        {/* STARS */}
        {/* ================================================== */}

        <div className="absolute left-[8%] top-20 rotate-[-10deg] text-[#fff4a8]">
          <Star size={28} fill="currentColor" />
        </div>

        <div className="absolute left-[22%] top-12 text-white">
          ✦
        </div>

        <div className="absolute left-[32%] top-28 text-[#fff4a8]">
          ⭐
        </div>

        <div className="absolute left-[5%] top-[45%] text-white">
          ✨
        </div>

        <div className="absolute right-[24%] top-[24%] text-white">
          ✦
        </div>

        <div className="absolute right-[8%] top-[43%] text-[#fff4a8]">
          ⭐
        </div>

        <div className="absolute right-[27%] top-[55%] text-white">
          ✨
        </div>

        <div className="absolute left-[13%] bottom-[20%] text-[#fff4a8]">
          ✦
        </div>

        <div className="absolute right-[11%] bottom-[18%] text-white">
          ✦
        </div>

        {/* ================================================== */}
        {/* CLOUDS */}
        {/* ================================================== */}

        {/* Cloud 1 */}
        <div className="absolute left-[-20px] top-[28%]">
          <div className="relative h-20 w-52">
            <div className="absolute bottom-0 left-0 h-12 w-52 rounded-full bg-white" />
            <div className="absolute bottom-5 left-8 h-20 w-20 rounded-full bg-white" />
            <div className="absolute bottom-7 left-20 h-24 w-24 rounded-full bg-white" />
            <div className="absolute bottom-3 right-8 h-14 w-14 rounded-full bg-white" />
          </div>
        </div>

        {/* Cloud 2 */}
        <div className="absolute right-[-45px] top-[64%]">
          <div className="relative h-16 w-48">
            <div className="absolute bottom-0 left-0 h-10 w-48 rounded-full bg-white/80" />
            <div className="absolute bottom-3 left-10 h-16 w-16 rounded-full bg-white/80" />
            <div className="absolute bottom-4 left-24 h-14 w-14 rounded-full bg-white/80" />
          </div>
        </div>

        {/* Cloud 3 */}
        <div className="absolute left-[28%] top-[5%] opacity-80">
          <div className="relative h-10 w-28">
            <div className="absolute bottom-0 h-7 w-28 rounded-full bg-white" />
            <div className="absolute bottom-2 left-5 h-10 w-10 rounded-full bg-white" />
            <div className="absolute bottom-2 right-5 h-8 w-8 rounded-full bg-white" />
          </div>
        </div>

        {/* ================================================== */}
        {/* RAINBOW */}
        {/* ================================================== */}

        <div
          className="
            absolute
            -bottom-28
            left-1/2
            hidden
            h-72
            w-[650px]
            -translate-x-1/2
            rounded-t-full
            border-[24px]
            border-[#ff9fbd]/30
            sm:block
          "
        />

        <div
          className="
            absolute
            -bottom-36
            left-1/2
            hidden
            h-72
            w-[600px]
            -translate-x-1/2
            rounded-t-full
            border-[22px]
            border-[#fff0a8]/30
            sm:block
          "
        />

        {/* ================================================== */}
        {/* ROCKET */}
        {/* ================================================== */}

        <div
          className="
            absolute
            bottom-[10%]
            left-[7%]
            hidden
            rotate-[-15deg]
            sm:block
          "
        >
          <div className="relative">
            <div
              className="
                flex
                h-20
                w-16
                items-center
                justify-center
                rounded-t-[50%]
                rounded-b-[45%]
                border-4
                border-[#ec6b72]
                bg-[#ff8790]
                shadow-lg
              "
            >
              <div className="h-8 w-8 rounded-full border-4 border-[#66c7e8] bg-[#bceeff]" />
            </div>

            {/* Rocket fins */}
            <div className="absolute -bottom-2 -left-4 h-8 w-7 rotate-[20deg] rounded-bl-xl bg-[#e65b68]" />
            <div className="absolute -bottom-2 -right-4 h-8 w-7 rotate-[-20deg] rounded-br-xl bg-[#e65b68]" />

            {/* Flame */}
            <div
              className="
                absolute
                -bottom-9
                left-1/2
                h-10
                w-7
                -translate-x-1/2
                rounded-b-full
                bg-[#ffd75a]
              "
            />
          </div>
        </div>

        {/* ================================================== */}
        {/* LITTLE PLANET */}
        {/* ================================================== */}

        <div
          className="
            absolute
            bottom-[13%]
            right-[8%]
            hidden
            h-24
            w-24
            rounded-full
            bg-[#b695e9]
            shadow-[inset_-12px_-8px_0_rgba(91,70,150,0.18)]
            sm:block
          "
        >
          <div
            className="
              absolute
              -left-8
              top-10
              h-4
              w-40
              rotate-[-10deg]
              rounded-full
              border-[5px]
              border-[#f4c8e8]
            "
          />
        </div>
      </div>
    </>
  );
}

// ============================================================
// STORY CARD
// ============================================================

function StoryCard({
  story,
  index,
}: {
  story: any;
  index: number;
}) {
  const colors = [
    {
      card: "bg-[#fff8d9]",
      border: "border-[#f4c94d]",
      button: "bg-[#ff8a65]",
      buttonHover: "group-hover:bg-[#ff7650]",
      sticker: "bg-[#ffe27a]",
      stickerText: "text-[#735b00]",
    },
    {
      card: "bg-[#ffeaf3]",
      border: "border-[#f28bb5]",
      button: "bg-[#9b7bea]",
      buttonHover: "group-hover:bg-[#8965e1]",
      sticker: "bg-[#ffb7d3]",
      stickerText: "text-[#7c2850]",
    },
    {
      card: "bg-[#e5f8ff]",
      border: "border-[#6ccbe9]",
      button: "bg-[#42b9d8]",
      buttonHover: "group-hover:bg-[#2da9cb]",
      sticker: "bg-[#9de4f4]",
      stickerText: "text-[#155a70]",
    },
  ];

  const color = colors[index % colors.length];

  return (
    <Link
      href={`/story/${story.id}`}
      className="group block"
    >
      <article
        className={`
          relative
          overflow-hidden
          rounded-[32px]
          border-[5px]
          ${color.border}
          ${color.card}
          shadow-[0_10px_0_rgba(60,70,100,0.10)]
          transition-all
          duration-200
          hover:-translate-y-2
          hover:rotate-[-1deg]
          hover:shadow-[0_17px_0_rgba(60,70,100,0.12)]
        `}
      >
        {/* ================================================== */}
        {/* IMAGE */}
        {/* ================================================== */}

        <div className="relative m-3 overflow-hidden rounded-[24px]">
          <div className="aspect-[4/3] bg-[#dceff5]">
            <img
              src={story.coverImage}
              alt={story.title}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-300
                group-hover:scale-105
              "
            />
          </div>

          {/* Image sparkle */}
          <div className="absolute right-3 top-3 text-xl text-white drop-shadow-md">
            ✨
          </div>

          {/* Age sticker */}
          <div
            className={`
              absolute
              left-3
              top-3
              rotate-[-4deg]
              rounded-xl
              border-2
              border-white
              px-3
              py-2
              shadow-md
              ${color.sticker}
              ${color.stickerText}
            `}
          >
            <div className="text-[9px] font-black uppercase">
              For
            </div>
            <div className="text-sm font-black">
              Ages {story.ageGroup}
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* CONTENT */}
        {/* ================================================== */}

        <div className="px-6 pb-6 pt-2">
          <div className="flex items-start gap-2">
            <h3
              className="
                flex-1
                text-2xl
                font-black
                leading-tight
                text-[#3d4661]
              "
            >
              {story.title}
            </h3>

            <span className="mt-1 text-xl">
              ⭐
            </span>
          </div>

          <p
            className="
              mt-3
              line-clamp-2
              text-sm
              font-semibold
              leading-relaxed
              text-[#69738c]
            "
          >
            {story.description}
          </p>

          {/* Read button */}
          <div
            className={`
              mt-5
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              px-5
              py-3.5
              text-base
              font-black
              text-white
              shadow-[0_5px_0_rgba(60,60,80,0.15)]
              transition-all
              group-hover:translate-y-[-1px]
              ${color.button}
              ${color.buttonHover}
            `}
          >
            <BookOpen size={19} />

            READ ME!

            <span className="text-lg">→</span>
          </div>
        </div>

        {/* Decorative stars */}
        <div className="absolute bottom-3 left-4 text-sm text-[#f5c842]">
          ✦
        </div>

        <div className="absolute right-5 bottom-3 text-xs text-[#f5c842]">
          ✦
        </div>
      </article>
    </Link>
  );
}

// ============================================================
// HOME
// ============================================================

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ==================================================== */}
      {/* BACKGROUND */}
      {/* ==================================================== */}

      <KidsBackground />

      {/* ==================================================== */}
      {/* CONTENT */}
      {/* ==================================================== */}

      <div className="relative z-10">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header
          className="
            mx-auto
            flex
            max-w-6xl
            items-center
            justify-between
            px-5
            py-5
            sm:px-8
            sm:py-7
          "
        >
          {/* Logo */}
          <Link
            href="/"
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                rotate-[-7deg]
                items-center
                justify-center
                rounded-[18px]
                border-4
                border-white
                bg-[#ff8a8a]
                text-white
                shadow-[0_6px_0_rgba(150,70,80,0.18)]
              "
            >
              <BookOpen
                size={28}
                strokeWidth={3}
              />
            </div>

            <div>
              <div
                className="
                  text-xl
                  font-black
                  tracking-tight
                  text-[#374568]
                  sm:text-2xl
                "
              >
                Storyland
              </div>

              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#61708f]">
                Little Adventures
              </div>
            </div>
          </Link>

          {/* Little star */}
          <div
            className="
              hidden
              rotate-[4deg]
              rounded-2xl
              border-3
              border-white
              bg-[#ffe37a]
              px-4
              py-2
              text-sm
              font-black
              text-[#665300]
              shadow-[0_5px_0_rgba(130,110,40,0.15)]
              sm:block
            "
          >
            ⭐ Let's read!
          </div>
        </header>

        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <section
          className="
            mx-auto
            max-w-5xl
            px-5
            pb-14
            pt-8
            text-center
            sm:px-8
            sm:pb-20
            sm:pt-16
          "
        >
          {/* Tiny decoration */}
          <div className="mb-4 flex items-center justify-center gap-3 text-[#fff1a6]">
            <span className="text-xl">✦</span>
            <Star
              size={25}
              fill="currentColor"
            />
            <span className="text-xl">✦</span>
          </div>

          {/* Main title */}
          <h1
            className="
              text-5xl
              font-black
              leading-[0.95]
              tracking-tight
              text-[#3d4661]
              sm:text-7xl
            "
          >
            Hi there,
            <span
              className="
                mt-2
                block
                text-[#ff6f83]
              "
            >
              Little Explorer! 👋
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mx-auto
              mt-6
              max-w-2xl
              text-lg
              font-bold
              leading-relaxed
              text-[#53617e]
              sm:text-xl
            "
          >
            Welcome to Storyland!
            <br />
            Pick a book, turn the pages,
            and let your imagination fly! 🚀✨
          </p>

          {/* Cute explorer badge */}
          <div
            className="
              mx-auto
              mt-8
              flex
              w-fit
              rotate-[-2deg]
              items-center
              gap-3
              rounded-[22px]
              border-4
              border-white
              bg-[#fff4a8]
              px-5
              py-3
              text-sm
              font-black
              text-[#665300]
              shadow-[0_6px_0_rgba(120,100,30,0.12)]
            "
          >
            <Rocket size={20} />
            Your next adventure is waiting!
            <span>⭐</span>
          </div>

          {/* Decorative line */}
          <div className="mx-auto mt-12 flex max-w-md items-center justify-center gap-4">
            <div className="h-[3px] flex-1 rounded-full bg-white/70" />
            <span className="text-2xl text-[#fff0a8]">
              ✨
            </span>
            <div className="h-[3px] flex-1 rounded-full bg-white/70" />
          </div>
        </section>

        {/* ================================================== */}
        {/* STORY SECTION */}
        {/* ================================================== */}

        <section
          id="stories"
          className="
            relative
            bg-[#fffdf3]
            px-5
            pb-24
            pt-16
            sm:px-8
            sm:pt-20
          "
        >
          {/* Wavy-ish top decoration */}
          <div className="absolute left-0 right-0 top-0 flex -translate-y-1/2 justify-center">
            <div
              className="
                rounded-full
                border-4
                border-white
                bg-[#fffdf3]
                px-7
                py-3
                text-sm
                font-black
                text-[#ff7184]
                shadow-sm
              "
            >
              📚 STORY TIME!
            </div>
          </div>

          <div className="mx-auto max-w-6xl">
            {/* Section heading */}
            <div className="mb-12 text-center">
              <div className="mb-3 text-3xl">
                🌈 ⭐ 🚀 ⭐ 🌈
              </div>

              <h2
                className="
                  text-4xl
                  font-black
                  tracking-tight
                  text-[#3d4661]
                  sm:text-5xl
                "
              >
                Pick a Story!
              </h2>

              <p
                className="
                  mt-3
                  text-base
                  font-bold
                  text-[#7a8398]
                "
              >
                Which adventure sounds fun today?
              </p>
            </div>

            {/* Story cards */}
            <div
              className="
                grid
                grid-cols-1
                gap-8
                md:grid-cols-2
                lg:grid-cols-3
              "
            >
              {MOCK_STORIES.map(
                (story, index) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    index={index}
                  />
                )
              )}
            </div>

            {/* ================================================== */}
            {/* FUN BOTTOM SECTION */}
            {/* ================================================== */}

            {/* <div
              className="
                relative
                mt-16
                overflow-hidden
                rounded-[35px]
                border-[5px]
                border-[#8ed8f8]
                bg-[#dff7ff]
                px-7
                py-10
                text-center
                shadow-[0_8px_0_rgba(80,160,190,0.12)]
                sm:px-12
              "
            > */}
              {/* Decorative stars
              <div className="absolute left-6 top-5 text-2xl text-[#ffd95a]">
                ⭐
              </div>

              <div className="absolute right-7 top-7 text-xl text-[#ff9bb4]">
                ✨
              </div>

              <div className="absolute bottom-5 left-10 text-xl text-[#b49bea]">
                ✦
              </div>

              <div className="absolute bottom-6 right-8 text-2xl text-[#ffd95a]">
                ⭐
              </div> */}

              {/* Content */}
              {/* <div className="relative"> */}
                {/* <div className="mb-3 text-4xl">
                  🧑‍🚀
                </div>

                <h3
                  className="
                    text-2xl
                    font-black
                    text-[#3d4661]
                    sm:text-3xl
                  "
                >
                  Ready for a big adventure?
                </h3> */}

                {/* <p
                  className="
                    mx-auto
                    mt-3
                    max-w-lg
                    text-sm
                    font-bold
                    leading-relaxed
                    text-[#65738d]
                  "
                >
                  Every book is a new world.
                  Open one and see where it takes you!
                </p> */}
{/* 
                <a
                  href="#stories"
                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-2xl
                    border-4
                    border-white
                    bg-[#ff8a65]
                    px-7
                    py-3.5
                    text-base
                    font-black
                    text-white
                    shadow-[0_6px_0_rgba(170,80,60,0.18)]
                    transition-all
                    hover:translate-y-[-2px]
                    hover:bg-[#ff7650]
                  "
                >
                  <BookOpen size={20} />
                  Find a Book!
                  <ArrowRight size={18} />
                </a> */}
              {/* </div> */}
            {/* </div> */}
          </div>
        </section>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <footer
          className="
            bg-[#8ed8f8]
            px-5
            py-10
            text-center
          "
        >
          <div className="text-3xl">
            ⭐ 🌙 ⭐
          </div>

          <p
            className="
              mt-3
              text-sm
              font-black
              text-[#405474]
            "
          >
            Keep dreaming. Keep reading. Keep exploring! 🚀
          </p>

          <p className="mt-2 text-xs font-bold text-[#5d7899]">
            Made for little imaginations 💛
          </p>
        </footer>
      </div>
    </main>
  );
}