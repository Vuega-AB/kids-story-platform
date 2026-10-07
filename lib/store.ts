import { Parent, Story, MembershipStatus } from "@/types/story";
import { MOCK_STORIES } from "./mock-data";
import { supabase } from "./supabase";

/* =========================================================
   MEMBERSHIP HELPERS
========================================================= */

export function getMembershipStatus(email: string): MembershipStatus {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.endsWith("@vuega.se")) {
    return "member";
  }
  return "waiting";
}

export function isMember(parent: Parent | null): boolean {
  return Boolean(
    parent && parent.verified && parent.membershipStatus === "member"
  );
}

export function isWaiting(parent: Parent | null): boolean {
  return Boolean(
    parent && parent.verified && parent.membershipStatus === "waiting"
  );
}

/* =========================================================
   SESSION (COOKIES BASED - NO LOCALSTORAGE)
========================================================= */

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

export async function getCurrentParent(): Promise<Parent | null> {
  const email = getCookie("storyland_user_email");
  if (!email) return null;
  return await getParentByEmail(email);
}

export function setCurrentParentSession(parent: Parent | null) {
  if (parent?.email) {
    setCookie("storyland_user_email", parent.email.toLowerCase().trim());
  } else {
    deleteCookie("storyland_user_email");
  }
}

/* =========================================================
   PARENTS / AUTH (SUPABASE)
========================================================= */

export async function getParentByEmail(email: string): Promise<Parent | null> {
  try {
    const { data, error } = await supabase
      .from("parents")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      verified: data.verified,
      membershipStatus: data.membership_status as MembershipStatus,
    };
  } catch {
    return null;
  }
}

export async function saveParentToCloud(parent: Parent): Promise<Parent | null> {
  try {
    const { data, error } = await supabase
      .from("parents")
      .upsert(
        [
          {
            id: parent.id || undefined,
            name: parent.name,
            email: parent.email.toLowerCase().trim(),
            password: parent.password,
            verified: parent.verified,
            membership_status: parent.membershipStatus,
          },
        ],
        { onConflict: "email" }
      )
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      verified: data.verified,
      membershipStatus: data.membership_status,
    };
  } catch (err) {
    console.error("Supabase parent save error:", err);
    return null;
  }
}

/* =========================================================
   STORIES (SUPABASE)
========================================================= */

export async function getStories(): Promise<Story[]> {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const cloudStories: Story[] = (data || []).map((item) => ({
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

    // Seed mock stories if database is completely empty
    if (cloudStories.length === 0) {
      for (const mock of MOCK_STORIES) {
        await createStory(mock);
      }
      return MOCK_STORIES;
    }

    return cloudStories;
  } catch (err) {
    console.error("Fetch stories error:", err);
    return MOCK_STORIES;
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
    return true;
  } catch (err) {
    console.error("Supabase story creation error:", err);
    return false;
  }
}

/* =========================================================
   LIKES (SUPABASE)
========================================================= */

export async function getLikedStories(userEmail?: string): Promise<string[]> {
  if (!userEmail) return [];
  try {
    const { data } = await supabase
      .from("user_likes")
      .select("story_id")
      .eq("user_email", userEmail.toLowerCase().trim());
    return (data || []).map((row) => row.story_id);
  } catch {
    return [];
  }
}

export async function toggleLike(storyId: string, userEmail?: string): Promise<{ liked: boolean; totalLikes: number }> {
  const email = userEmail || getCookie("storyland_user_email") || "guest@storyland.com";
  try {
    // Check if already liked
    const { data: existing } = await supabase
      .from("user_likes")
      .select("id")
      .eq("user_email", email)
      .eq("story_id", storyId)
      .maybeSingle();

    const story = await getStory(storyId);
    let newLikesCount = story?.likes || 0;

    if (existing) {
      // Remove like
      await supabase.from("user_likes").delete().eq("id", existing.id);
      newLikesCount = Math.max(0, newLikesCount - 1);
    } else {
      // Add like
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

/* =========================================================
   FAVORITES (SUPABASE)
========================================================= */

export async function getFavorites(userEmail?: string): Promise<string[]> {
  const email = userEmail || getCookie("storyland_user_email");
  if (!email) return [];
  try {
    const { data } = await supabase
      .from("favorites")
      .select("story_id")
      .eq("user_email", email.toLowerCase().trim());
    return (data || []).map((row) => row.story_id);
  } catch {
    return [];
  }
}

export async function toggleFavorite(storyId: string, userEmail?: string): Promise<boolean> {
  const email = userEmail || getCookie("storyland_user_email") || "guest@storyland.com";
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
   READING PROGRESS (SUPABASE)
========================================================= */

export type ReadingProgress = {
  page: number;
  total: number;
  completed: boolean;
};

export async function saveReadingProgress(storyId: string, page: number, total: number, userEmail?: string) {
  const email = userEmail || getCookie("storyland_user_email") || "guest@storyland.com";
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
  } catch (err) {
    console.error("Error saving progress:", err);
  }
}

export async function getContinueReading(userEmail?: string) {
  const email = userEmail || getCookie("storyland_user_email") || "guest@storyland.com";
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

/* =========================================================
   USER STREAK & BADGES (SUPABASE)
========================================================= */

export async function getUserStats(userEmail?: string) {
  const email = userEmail || getCookie("storyland_user_email") || "guest@storyland.com";
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
      achievements: data.achievements || [],
    };
  } catch {
    return { streak: 1, achievements: [] };
  }
}