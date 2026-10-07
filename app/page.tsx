"use client";
import { useEffect, useState, useMemo } from "react";
import {
  getStories,
  getLikedStories,
  toggleLike,
  getContinueReading,
  getUserStats,
  getFavorites,
  getCurrentParent,
} from "@/lib/store";
import { Story } from "@/types/story";
import Link from "next/link";
import { Clock, Trophy, Flame, Sparkles, Star, Rocket, BookOpen, Search, Heart, Wand2 } from "lucide-react";

function KidsBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#8ed8f8]">
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#a9e5ff]" />
      <div className="absolute -right-40 top-40 h-[500px] w-[500px] rounded-full bg-[#78cbed]" />
      <div className="absolute right-[7%] top-12 h-28 w-28 rounded-full bg-[#ffe77a] shadow-[0_0_0_12px_rgba(255,231,122,0.18)]">
        <div className="absolute left-7 top-7 h-3 w-3 rounded-full bg-[#e7b94c]/40" />
        <div className="absolute right-7 top-10 h-4 w-4 rounded-full bg-[#e7b94c]/30" />
        <div className="absolute bottom-7 left-10 h-3 w-3 rounded-full bg-[#e7b94c]/30" />
      </div>
      <div className="absolute left-[8%] top-20 animate-bounce text-[#fff4a8] duration-[3000ms]"><Star size={28} fill="currentColor" /></div>
      <div className="absolute right-[15%] top-40 animate-pulse text-white">✦</div>
      <div className="absolute left-[32%] top-28 text-[#fff4a8]">⭐</div>
    </div>
  );
}

function StoryCard({ story, index, liked, onLike }: { story: Story; index: number; liked: boolean; onLike: (id: string) => void }) {
  const colors = [
    { card: "bg-[#fff8d9]", border: "border-[#f4c94d]", button: "bg-[#ff8a65]", sticker: "bg-[#ffe27a]", text: "text-[#735b00]" },
    { card: "bg-[#ffeaf3]", border: "border-[#f28bb5]", button: "bg-[#9b7bea]", sticker: "bg-[#ffb7d3]", text: "text-[#7c2850]" },
    { card: "bg-[#e5f8ff]", border: "border-[#6ccbe9]", button: "bg-[#42b9d8]", sticker: "bg-[#9de4f4]", text: "text-[#155a70]" },
  ];
  const color = colors[index % colors.length];

  return (
    <article className={`group relative overflow-hidden rounded-[32px] border-[5px] ${color.border} ${color.card} shadow-[0_10px_0_rgba(60,70,100,0.10)] transition-all duration-300 hover:-translate-y-3`}>
      <Link href={`/story/${story.id}`} className="block">
        <div className="relative m-3 overflow-hidden rounded-[24px]">
          <img src={story.coverImage} alt={story.title} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          <div className={`absolute left-3 top-3 rotate-[-4deg] rounded-xl border-2 border-white px-3 py-1 shadow-md ${color.sticker} ${color.text} text-xs font-black`}>
            AGES {story.ageGroup}
          </div>
        </div>
        <div className="px-6 py-2">
          <h3 className="text-2xl font-black text-[#3d4661] group-hover:text-[#ff6f83] transition-colors">{story.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm font-bold text-[#69738c]">{story.description}</p>
        </div>
      </Link>
      <div className="flex items-center gap-3 px-6 pb-6 pt-4">
        <button 
          onClick={() => onLike(story.id)} 
          className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl font-black text-white shadow-[0_5px_0_rgba(0,0,0,0.1)] transition-transform active:translate-y-1 ${liked ? 'bg-pink-500' : color.button}`}
        >
          <Heart size={19} fill={liked ? "currentColor" : "none"} />
          {story.likes}
        </button>
        <Link href={`/story/${story.id}`} className="flex h-12 flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black text-[#59647c] shadow-[0_5px_0_rgba(0,0,0,0.05)] hover:bg-gray-50">
          <BookOpen size={18} /> READ NOW
        </Link>
      </div>
    </article>
  );
}

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"newest" | "likes">("newest");
  const [likedStories, setLikedStories] = useState<string[]>([]);
  const [continueReading, setContinueReading] = useState<any>(null);
  const [streak, setStreak] = useState(1);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const cloudStories = await getStories();
      setStories(cloudStories);

      const parent = await getCurrentParent();
      const email = parent?.email;

      const [liked, cr, stats, favs] = await Promise.all([
        getLikedStories(email),
        getContinueReading(email),
        getUserStats(email),
        getFavorites(email),
      ]);

      setLikedStories(liked);
      setContinueReading(cr);
      setStreak(stats.streak);
      setAchievements(stats.achievements);
      setFavorites(favs);
    }
    loadData();
  }, []);

  const categories = [
    { name: "All", icon: <Sparkles size={18} /> },
    { name: "Adventure", icon: <Rocket size={18} /> },
    { name: "Fairy Tale", icon: <Wand2 size={18} /> },
    { name: "Science", icon: <Star size={18} /> },
    { name: "Moral", icon: <Heart size={18} /> },
  ];

  const handleLike = async (id: string) => {
    const res = await toggleLike(id);
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, likes: res.totalLikes } : s))
    );
    setLikedStories((prev) =>
      res.liked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const filteredStories = useMemo(() => {
    return stories
      .filter((story) => {
        const matchesSearch = `${story.title} ${story.description}`.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "All" || story.category === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => (sort === "likes" ? b.likes - a.likes : 0));
  }, [stories, search, category, sort]);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <KidsBackground />

      <div className="relative z-10">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-14 w-14 rotate-[-7deg] items-center justify-center rounded-[18px] border-4 border-white bg-[#ff8a8a] text-white shadow-md">
              <BookOpen size={28} strokeWidth={3} />
            </div>
            <div>
              <div className="text-xl font-black text-[#374568] sm:text-2xl">Storyland</div>
              <div className="text-[10px] font-black uppercase text-[#61708f]">Dream Big!</div>
            </div>
          </Link>
          <div className="flex gap-3">
             <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/50 px-4 py-2 text-sm font-black text-[#53617e]">
               <Flame size={18} className="text-orange-500" /> {streak} Day Streak!
             </div>
             <Link href="/parents" className="rounded-2xl border-3 border-white bg-[#ffe37a] px-4 py-2 text-sm font-black text-[#665300] shadow-sm">
               👨‍👩‍👧 Parents
             </Link>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-5 pb-10 pt-8 text-center sm:pt-16">
          <h1 className="text-4xl font-black leading-tight text-[#3d4661] sm:text-7xl">
            Welcome, <span className="block text-[#ff6f83]">Little Explorer! 👋</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-bold text-[#53617e] sm:text-xl">
            Explore magical worlds stored in the cloud. Which world will you visit today?
          </p>
        </section>

        {continueReading && (
          <section className="mx-auto max-w-5xl px-5 pb-10">
            <Link href={`/story/${continueReading.story.id}`} className="block overflow-hidden rounded-[35px] border-4 border-white bg-gradient-to-br from-[#9b7bea] to-[#ff8a8a] p-6 text-white shadow-xl">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[25px] border-4 border-white shadow-lg">
                  <img src={continueReading.story.coverImage} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/90">
                    <Clock size={16} /> Jump Back In!
                  </div>
                  <h2 className="mt-1 text-3xl font-black">{continueReading.story.title}</h2>
                </div>
                <div className="rounded-2xl bg-white px-8 py-4 text-center font-black text-[#765bd0] shadow-lg">
                  READ NOW ✨
                </div>
              </div>
            </Link>
          </section>
        )}

        <section id="stories" className="relative bg-[#fffdf3] px-5 pb-24 pt-16 rounded-t-[50px] shadow-lg">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black transition-all ${
                    category === cat.name 
                    ? "bg-[#3d4661] text-white scale-110 shadow-lg" 
                    : "bg-white text-[#59647c] border-2 border-gray-100 hover:border-[#ff8a8a]"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            <div className="mx-auto mb-12 flex max-w-4xl flex-col gap-4 sm:flex-row">
              <div className="flex flex-1 items-center rounded-[22px] border-4 border-[#f0dba2] bg-white px-5 py-4 shadow-sm">
                <Search size={22} className="mr-3 text-[#ff8a65]" />
                <input 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Search for magic, dragons, space..." 
                  className="w-full bg-transparent font-bold text-[#3d4661] outline-none" 
                />
              </div>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value as "newest" | "likes")} 
                className="rounded-[22px] border-4 border-[#f0dba2] bg-white px-6 py-4 font-black text-[#59647c] outline-none cursor-pointer"
              >
                <option value="newest">✨ Newest First</option>
                <option value="likes">❤️ Most Loved</option>
              </select>
            </div>

            {/* Stats Overview */}
            <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-[30px] border-4 border-white bg-[#fff4a8] p-6 shadow-md flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff8a65] text-white shadow-inner"><Flame fill="currentColor" /></div>
                <div><p className="text-[10px] font-black uppercase text-[#8b7200]">Streak</p><p className="text-2xl font-black text-[#5f5200]">{streak} Days</p></div>
              </div>
              <div className="rounded-[30px] border-4 border-white bg-[#e5f8ff] p-6 shadow-md flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#42b9d8] text-white shadow-inner"><Trophy fill="currentColor" /></div>
                <div><p className="text-[10px] font-black uppercase text-[#286d82]">Badges</p><p className="text-2xl font-black text-[#155a70]">{achievements.length} Earned</p></div>
              </div>
              <div className="rounded-[30px] border-4 border-white bg-[#ffeaf3] p-6 shadow-md flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f28bb5] text-white shadow-inner"><Heart fill="currentColor" /></div>
                <div><p className="text-[10px] font-black uppercase text-[#8b365d]">Favorites</p><p className="text-2xl font-black text-[#7c2850]">{favorites.length} Stories</p></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {filteredStories.map((story, index) => (
                <StoryCard key={story.id} story={story} index={index} liked={likedStories.includes(story.id)} onLike={handleLike} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}