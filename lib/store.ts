import { Parent, Story } from "@/types/story";
import { supabase } from "./supabase";

/* =========================================================
   MEMBERSHIP & SESSION HELPERS
========================================================= */
export function isMember(parent: Parent | null): boolean {
  return Boolean(parent && parent.verified);
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function getGuestIdentifier(): string {
  if (typeof window === "undefined") return "guest@storyland.com";
  try {
    const key = "storyland_guest_id";
    let guestId = window.localStorage.getItem(key);
    if (!guestId) {
      guestId = `guest_${crypto.randomUUID()}@storyland.local`;
      window.localStorage.setItem(key, guestId);
    }
    return guestId;
  } catch {
    return "guest@storyland.com";
  }
}

function resolveUserEmail(userEmail?: string): string {
  const email = userEmail || getCookie("storyland_user_email");
  return email ? email.toLowerCase().trim() : getGuestIdentifier();
}

export async function getCurrentParent(): Promise<Parent | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const parent = (data?.parent as Parent | null) ?? null;
    if (parent?.email) {
      setCookie("storyland_user_email", parent.email.toLowerCase().trim());
    } else {
      deleteCookie("storyland_user_email");
    }
    return parent;
  } catch {
    return null;
  }
}

export function setCurrentParentSession(parent: Parent | null) {
  if (parent?.email) {
    setCookie("storyland_user_email", parent.email.toLowerCase().trim());
  } else {
    deleteCookie("storyland_user_email");
    if (typeof window !== "undefined") {
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
  }
}

/* =========================================================
   STORIES
========================================================= */
export async function getStories(): Promise<Story[]> {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      coverImage: item.cover_image,
      author: item.author,
      ageGroup: item.age_group,
      category: item.category,
      likes: item.likes || 0,
      pages: item.pages || [],
    }));
  } catch (err) {
    console.error("Fetch stories error:", err);
    return [];
  }
}

export async function getStory(id: string): Promise<Story | null> {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      coverImage: data.cover_image,
      author: data.author,
      ageGroup: data.age_group,
      category: data.category,
      likes: data.likes || 0,
      pages: data.pages || [],
    };
  } catch {
    return null;
  }
}

export async function createStory(story: Story): Promise<boolean> {
  try {
    const { error } = await supabase.from("stories").upsert([
      {
        id: story.id || crypto.randomUUID(),
        title: story.title,
        description: story.description,
        cover_image: story.coverImage,
        author: story.author,
        age_group: story.ageGroup,
        category: story.category,
        likes: story.likes || 0,
        pages: story.pages,
      },
    ]);

    if (error) throw error;

    await recordUserAchievement("story-creator");
    return true;
  } catch (err) {
    console.error("Supabase story creation error:", err);
    return false;
  }
}

/* =========================================================
   LIKES & FAVORITES
========================================================= */
export async function getLikedStories(userEmail?: string): Promise<string[]> {
  const email = resolveUserEmail(userEmail);
  try {
    const { data } = await supabase
      .from("user_likes")
      .select("story_id")
      .eq("user_email", email);
    return (data || []).map((row) => row.story_id);
  } catch {
    return [];
  }
}

export async function toggleLike(
  storyId: string,
  userEmail?: string
): Promise<{ liked: boolean; totalLikes: number }> {
  const email = resolveUserEmail(userEmail);
  try {
    const { data: existing } = await supabase
      .from("user_likes")
      .select("id")
      .eq("user_email", email)
      .eq("story_id", storyId)
      .maybeSingle();

    const story = await getStory(storyId);
    let newLikesCount = story?.likes || 0;

    if (existing) {
      await supabase.from("user_likes").delete().eq("id", existing.id);
      newLikesCount = Math.max(0, newLikesCount - 1);
    } else {
      await supabase.from("user_likes").insert([{ user_email: email, story_id: storyId }]);
      newLikesCount += 1;
    }

    await supabase.from("stories").update({ likes: newLikesCount }).eq("id", storyId);
    return { liked: !existing, totalLikes: newLikesCount };
  } catch (err) {
    console.error("Like error:", err);
    return { liked: false, totalLikes: 0 };
  }
}

export async function getFavorites(userEmail?: string): Promise<string[]> {
  const email = resolveUserEmail(userEmail);
  try {
    const { data } = await supabase
      .from("favorites")
      .select("story_id")
      .eq("user_email", email);
    return (data || []).map((row) => row.story_id);
  } catch {
    return [];
  }
}

export async function toggleFavorite(storyId: string, userEmail?: string): Promise<boolean> {
  const email = resolveUserEmail(userEmail);
  try {
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_email", email)
      .eq("story_id", storyId)
      .maybeSingle();

    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id);
      return false;
    } else {
      await supabase.from("favorites").insert([{ user_email: email, story_id: storyId }]);
      return true;
    }
  } catch {
    return false;
  }
}

/* =========================================================
   READING PROGRESS & STATS
========================================================= */
async function recordUserAchievement(badge: string, userEmail?: string) {
  const email = resolveUserEmail(userEmail);
  try {
    const stats = await getUserStats(email);
    const updatedAchievements = Array.from(new Set([...(stats.achievements || []), badge]));
    await supabase.from("user_stats").upsert(
      [
        {
          user_email: email,
          streak: stats.streak || 1,
          achievements: updatedAchievements,
        },
      ],
      { onConflict: "user_email" }
    );
  } catch {
    // Non-blocking if user_stats table constraints differ
  }
}

export async function saveReadingProgress(
  storyId: string,
  page: number,
  total: number,
  userEmail?: string
) {
  const email = resolveUserEmail(userEmail);
  const safeTotal = Math.max(1, total);
  const safePage = Math.max(0, Math.min(page, safeTotal - 1));
  const completed = safePage >= safeTotal - 1;

  try {
    await supabase.from("reading_progress").upsert(
      [
        {
          user_email: email,
          story_id: storyId,
          page: safePage,
          total: safeTotal,
          completed,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "user_email,story_id" }
    );

    if (completed) {
      await recordUserAchievement("bookworm", email);
    }
  } catch (err) {
    console.error("Error saving progress:", err);
  }
}

export async function getContinueReading(userEmail?: string) {
  const email = resolveUserEmail(userEmail);
  try {
    const { data } = await supabase
      .from("reading_progress")
      .select("story_id, page, total, completed")
      .eq("user_email", email)
      .eq("completed", false)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    const story = await getStory(data.story_id);
    if (!story) return null;

    return {
      story,
      progress: {
        page: data.page,
        total: data.total,
        completed: data.completed,
      },
    };
  } catch {
    return null;
  }
}

export async function getUserStats(userEmail?: string) {
  const email = resolveUserEmail(userEmail);
  try {
    const { data } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_email", email)
      .maybeSingle();

    if (!data) {
      return { streak: 1, achievements: ["first-story"] };
    }
    return {
      streak: data.streak || 1,
      achievements: data.achievements || ["first-story"],
    };
  } catch {
    return { streak: 1, achievements: ["first-story"] };
  }
}
