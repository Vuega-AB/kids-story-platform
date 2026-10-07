"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createStory,
  getCurrentParent,
  isMember,
} from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Wand2,
  BookOpen,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  Lightbulb,
  Rocket,
} from "lucide-react";

type AgeGroup = "3-5" | "6-8" | "9-12";
type Category = "Adventure" | "Fairy Tale" | "Science" | "Moral";

type StoryPage = {
  id: number;
  text: string;
  imageUrl: string;
};

type GeneratedStory = {
  title: string;
  description: string;
  pages: StoryPage[];
};

const CHARACTER_TYPES = [
  "curious little fox",
  "brave little cat",
  "funny young dragon",
  "clever rabbit",
  "tiny astronaut",
  "friendly robot",
  "little wizard",
  "young explorer",
  "talking puppy",
  "magical unicorn",
];

const SETTINGS = [
  "a magical forest",
  "a secret island",
  "a floating castle",
  "the moon",
  "an underwater kingdom",
  "a tiny village in the clouds",
  "a mysterious space station",
  "a hidden garden",
  "a colorful dinosaur valley",
  "a magical library",
];

const MAGICAL_OBJECTS = [
  "a glowing golden key",
  "a talking compass",
  "a tiny magic backpack",
  "a sparkling star",
  "a mysterious map",
  "a pair of flying shoes",
  "a magical telescope",
  "a rainbow crystal",
  "a little robot friend",
  "an invisible paintbrush",
];

const MOODS = [
  "Funny and silly",
  "Magical and dreamy",
  "Exciting and adventurous",
  "Warm and heartwarming",
  "Mysterious and curious",
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function getPageCount(ageGroup: AgeGroup) {
  if (ageGroup === "3-5") return 6;
  if (ageGroup === "9-12") return 8;
  return 7;
}

export default function CreateStoryPage() {
  const router = useRouter();

  const [parent, setParent] = useState<any>(null);
  const [checkingMembership, setCheckingMembership] = useState(true);

  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("6-8");
  const [category, setCategory] = useState<Category>("Adventure");
  const [character, setCharacter] = useState("");
  const [setting, setSetting] = useState("");
  const [magicalObject, setMagicalObject] = useState("");
  const [mood, setMood] = useState("Funny and silly");
  const [lesson, setLesson] = useState("");

  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [created, setCreated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  /* =====================================================
     MEMBERSHIP CHECK (SUPABASE ASYNC)
  ===================================================== */

  useEffect(() => {
    async function checkAuth() {
      const current = await getCurrentParent();
      if (!current || !isMember(current)) {
        router.replace("/parents");
        return;
      }
      setParent(current);
      setCheckingMembership(false);
    }
    checkAuth();
  }, [router]);

  /* =====================================================
     GENERATE STORY
  ===================================================== */

  const generateStory = async () => {
    if (!parent || isGenerating) {
      return;
    }

    const current = await getCurrentParent();
    if (!current || !isMember(current)) {
      router.replace("/parents");
      return;
    }

    const cleanIdea = cleanText(idea);
    const cleanCharacter = cleanText(character);
    const cleanSetting = cleanText(setting);
    const cleanMagicalObject = cleanText(magicalObject);
    const cleanLesson = cleanText(lesson);
    const cleanTitle = cleanText(title);

    setError("");
    setSaveMessage("");
    setIsGenerating(true);
    setGeneratedStory(null);
    setCreated(false);

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: current.email,
          idea: cleanIdea,
          title: cleanTitle,
          ageGroup,
          category,
          character: cleanCharacter || randomItem(CHARACTER_TYPES),
          setting: cleanSetting || randomItem(SETTINGS),
          magicalObject: cleanMagicalObject || randomItem(MAGICAL_OBJECTS),
          mood,
          lesson: cleanLesson,
          pageCount: getPageCount(ageGroup),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Something went wrong while creating the story."
        );
      }

      if (!data?.story?.title || !Array.isArray(data.story.pages)) {
        throw new Error("The AI returned an invalid story structure.");
      }

      const pages: StoryPage[] = data.story.pages
        .slice(0, getPageCount(ageGroup))
        .map((page: any, index: number) => ({
          id: Number(page?.id) || index + 1,
          text: cleanText(String(page?.text || "")),
          imageUrl: typeof page?.imageUrl === "string" ? page.imageUrl : "",
        }))
        .filter((page: StoryPage) => page.text.length > 0);

      if (!pages.length) {
        throw new Error("The AI did not generate any story pages.");
      }

      const story: GeneratedStory = {
        title:
          cleanTitle ||
          cleanText(String(data.story.title)),
        description:
          cleanText(String(data.story.description || "")) ||
          `A magical ${category.toLowerCase()} adventure for ages ${ageGroup}.`,
        pages,
      };

      setGeneratedStory(story);
    } catch (err: any) {
      console.error("Story generation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't create the story. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateStory = () => {
    if (isGenerating) return;
    generateStory();
  };

  /* =====================================================
     SAVE STORY TO SUPABASE CLOUD
  ===================================================== */

  const saveGeneratedStory = async () => {
    if (!generatedStory || !parent || isSaving || created) {
      return;
    }

    const current = await getCurrentParent();
    if (!current || !isMember(current)) {
      router.replace("/parents");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const story = {
        id: crypto.randomUUID(),
        title: generatedStory.title,
        description: generatedStory.description,
        coverImage: generatedStory.pages[0]?.imageUrl || "",
        author: parent.name || "Storyland Parent",
        ageGroup,
        category,
        likes: 0,
        pages: generatedStory.pages,
      };

      const wasSaved = await createStory(story);

      if (!wasSaved) {
        setSaveMessage("Could not save to database. Please try again.");
      } else {
        setSaveMessage("Your story is safely saved in Supabase! 🎉");
        setCreated(true);
      }
    } catch (err) {
      console.error("Save story error:", err);
      setSaveMessage("We couldn't save the story. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetStory = () => {
    setGeneratedStory(null);
    setCreated(false);
    setError("");
    setSaveMessage("");
    setTitle("");
    setIdea("");
    setCharacter("");
    setSetting("");
    setMagicalObject("");
    setLesson("");
    setMood("Funny and silly");
    setAgeGroup("6-8");
    setCategory("Adventure");
  };

  if (checkingMembership) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#8ed8f8] via-[#e8f9ff] to-[#ffeaf3]">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-[25px] bg-gradient-to-br from-[#9b7bea] to-[#ff7184] text-white shadow-lg">
            <Sparkles size={35} />
          </div>
          <p className="mt-5 font-black text-[#53617e]">
            Checking your Storyland membership...
          </p>
        </div>
      </main>
    );
  }

  if (!parent) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#8ed8f8] via-[#e8f9ff] to-[#ffeaf3] px-5 py-10 pb-32">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-black text-[#405474]"
        >
          <ArrowLeft size={20} />
          Back to Storyland
        </Link>

        <div className="overflow-hidden rounded-[35px] border-4 border-white bg-white/95 shadow-[0_15px_0_rgba(60,70,100,0.10)]">
          {!created ? (
            <>
              {/* HEADER */}
              <div className="bg-gradient-to-br from-[#9b7bea] to-[#ff8a8a] px-7 py-10 text-center text-white sm:px-10">
                <div className="mx-auto flex h-20 w-20 rotate-[-5deg] items-center justify-center rounded-[25px] border-4 border-white/50 bg-white/20 shadow-xl backdrop-blur">
                  <Wand2 size={36} />
                </div>
                <h1 className="mt-5 text-4xl font-black sm:text-5xl">
                  Create a Magical Story ✨
                </h1>
                <p className="mx-auto mt-3 max-w-xl font-semibold text-white/90">
                  Hello {parent.name}! Give us an idea and Storyland will turn it into a complete adventure with AI.
                </p>
                <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-white backdrop-blur">
                  <Check size={14} />
                  Storyland Member
                </div>
              </div>

              <div className="space-y-7 p-7 sm:p-10">
                {/* IDEA */}
                <div>
                  <label className="mb-2 block font-black text-[#53617e]">
                    💡 What should the story be about?
                  </label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    rows={4}
                    placeholder="Example: A little dragon gets lost in a magical forest and meets a lonely moon..."
                    className="w-full resize-none rounded-2xl border-2 border-[#e6eaf0] px-5 py-4 leading-relaxed outline-none transition focus:border-[#9b7bea] focus:ring-4 focus:ring-purple-100"
                  />
                  <div className="mt-2 flex items-start gap-2 text-xs font-bold text-[#9aa2b1]">
                    <Lightbulb size={15} className="mt-0.5 shrink-0" />
                    You don't need to write the story. Just give Storyland a simple idea!
                  </div>
                </div>

                {/* AGE + CATEGORY */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-black text-[#53617e]">
                      🎂 Age group
                    </label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                      className="w-full rounded-2xl border-2 border-[#e6eaf0] bg-white px-5 py-4 font-bold outline-none focus:border-[#9b7bea]"
                    >
                      <option value="3-5">3–5 years</option>
                      <option value="6-8">6–8 years</option>
                      <option value="9-12">9–12 years</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-black text-[#53617e]">
                      📚 Story type
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full rounded-2xl border-2 border-[#e6eaf0] bg-white px-5 py-4 font-bold outline-none focus:border-[#9b7bea]"
                    >
                      <option value="Adventure">🚀 Adventure</option>
                      <option value="Fairy Tale">🧚 Fairy Tale</option>
                      <option value="Science">🔬 Science</option>
                      <option value="Moral">❤️ Moral</option>
                    </select>
                  </div>
                </div>

                {/* ADVANCED */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="flex w-full items-center justify-between rounded-2xl border-2 border-[#eee9fa] bg-[#faf8ff] px-5 py-4 text-left font-black text-[#6750ad] transition hover:bg-[#f5f0ff]"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={18} />
                      Add more magical details
                    </span>
                    {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 grid grid-cols-1 gap-4 rounded-3xl bg-[#faf8ff] p-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-black text-[#53617e]">
                          👤 Main character
                        </label>
                        <input
                          value={character}
                          onChange={(e) => setCharacter(e.target.value)}
                          placeholder="A funny little dragon"
                          className="w-full rounded-2xl border-2 border-white bg-white px-4 py-3 font-semibold outline-none focus:border-[#9b7bea]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-black text-[#53617e]">
                          📍 Magical setting
                        </label>
                        <input
                          value={setting}
                          onChange={(e) => setSetting(e.target.value)}
                          placeholder="A forest made of candy"
                          className="w-full rounded-2xl border-2 border-white bg-white px-4 py-3 font-semibold outline-none focus:border-[#9b7bea]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-black text-[#53617e]">
                          🪄 Special object
                        </label>
                        <input
                          value={magicalObject}
                          onChange={(e) => setMagicalObject(e.target.value)}
                          placeholder="A talking backpack"
                          className="w-full rounded-2xl border-2 border-white bg-white px-4 py-3 font-semibold outline-none focus:border-[#9b7bea]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-black text-[#53617e]">
                          🎨 Mood
                        </label>
                        <select
                          value={mood}
                          onChange={(e) => setMood(e.target.value)}
                          className="w-full rounded-2xl border-2 border-white bg-white px-4 py-3 font-semibold outline-none focus:border-[#9b7bea]"
                        >
                          {MOODS.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-black text-[#53617e]">
                          ❤️ Optional lesson
                        </label>
                        <input
                          value={lesson}
                          onChange={(e) => setLesson(e.target.value)}
                          placeholder="Example: Sharing makes adventures better"
                          className="w-full rounded-2xl border-2 border-white bg-white px-4 py-3 font-semibold outline-none focus:border-[#9b7bea]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* TITLE */}
                <div>
                  <label className="mb-2 block font-black text-[#53617e]">
                    ✏️ Story title <span className="font-semibold text-[#9aa2b1]">(optional)</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Leave empty and AI will invent one!"
                    className="w-full rounded-2xl border-2 border-[#e6eaf0] px-5 py-4 outline-none transition focus:border-[#9b7bea] focus:ring-4 focus:ring-purple-100"
                  />
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
                    ⚠️ {error}
                  </div>
                )}

                {/* SAVE MESSAGE */}
                {saveMessage && (
                  <div className="rounded-2xl border-2 border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700 flex items-center gap-2">
                    <Check size={18} />
                    {saveMessage}
                  </div>
                )}

                {/* GENERATE BUTTON */}
                {!generatedStory ? (
                  <button
                    onClick={generateStory}
                    disabled={isGenerating}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#9b7bea] to-[#ff7184] py-5 text-lg font-black text-white shadow-[0_6px_0_rgba(90,60,150,0.20)] transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={23} className="animate-spin" />
                        DREAMING UP YOUR STORY...
                      </>
                    ) : (
                      <>
                        <Sparkles size={23} />
                        GENERATE MY STORY ✨
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-5">
                    {/* STORY PREVIEW */}
                    <div className="rounded-[30px] border-4 border-[#e9ddff] bg-gradient-to-br from-[#faf7ff] to-[#fff7fb] p-6">
                      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
                              {category}
                            </span>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                              Ages {ageGroup}
                            </span>
                            <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-black text-pink-700">
                              ✨ AI STORY
                            </span>
                          </div>
                          <h2 className="text-3xl font-black text-[#3d4661]">
                            {generatedStory.title}
                          </h2>
                          <p className="mt-2 font-semibold leading-relaxed text-[#7a8398]">
                            {generatedStory.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center justify-center rounded-2xl bg-[#ffe27a] p-3 text-[#665300]">
                          <Rocket size={28} />
                        </div>
                      </div>

                      {/* PAGE PREVIEW */}
                      <div className="space-y-5">
                        {generatedStory.pages.map((page) => (
                          <article
                            key={page.id}
                            className="overflow-hidden rounded-[25px] border-2 border-white bg-white shadow-sm"
                          >
                            {page.imageUrl ? (
                              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#eee7db]">
                                <img
                                  src={page.imageUrl}
                                  alt={`Illustration for page ${page.id}`}
                                  className="block h-full w-full object-cover"
                                />
                                <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-sm font-black text-[#765bd0] shadow">
                                  {page.id}
                                </div>
                              </div>
                            ) : (
                              <div className="flex aspect-[4/3] items-center justify-center bg-[#faf7ff] text-sm font-bold text-[#9aa2b1]">
                                Illustration unavailable
                              </div>
                            )}

                            <div className="p-5">
                              <p className="text-sm font-semibold leading-relaxed text-[#53617e]">
                                {page.text}
                              </p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        onClick={regenerateStory}
                        disabled={isGenerating || isSaving}
                        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#9b7bea] bg-white py-4 font-black text-[#765bd0] transition hover:bg-purple-50 disabled:opacity-50"
                      >
                        <RefreshCw size={19} className={isGenerating ? "animate-spin" : ""} />
                        TRY ANOTHER VERSION
                      </button>

                      <button
                        onClick={saveGeneratedStory}
                        disabled={isSaving || created}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#ff8a65] py-4 font-black text-white shadow-md transition hover:bg-[#ff7650] disabled:opacity-60"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw size={19} className="animate-spin" />
                            SAVING TO DATABASE...
                          </>
                        ) : (
                          <>
                            <BookOpen size={19} />
                            SAVE MY STORY 🚀
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setGeneratedStory(null);
                        setError("");
                        setSaveMessage("");
                      }}
                      disabled={isSaving}
                      className="w-full text-center text-sm font-black text-[#9aa2b1] underline decoration-2 underline-offset-4 hover:text-[#765bd0]"
                    >
                      ← Edit my story idea
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* STORY SAVED SCREEN */
            <div className="px-7 py-16 text-center sm:px-10">
              <div className="text-7xl">🎉</div>
              <h1 className="mt-5 text-4xl font-black text-[#3d4661]">
                Story Created & Saved in Cloud!
              </h1>
              <p className="mx-auto mt-4 max-w-md font-semibold leading-relaxed text-[#7a8398]">
                Your magical AI adventure has been saved to your Supabase database.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/")}
                  className="rounded-2xl bg-[#ff8a65] px-7 py-4 font-black text-white"
                >
                  <BookOpen className="mr-2 inline" size={19} />
                  VIEW LIBRARY
                </button>
                <button
                  onClick={resetStory}
                  className="rounded-2xl bg-[#9b7bea] px-7 py-4 font-black text-white"
                >
                  CREATE ANOTHER ✨
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}