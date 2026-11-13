import crypto from "crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedEmail } from "@/lib/server-auth";
import { supabaseAdmin } from "@/lib/supabase";

type AgeGroup = "3-5" | "6-8" | "9-12";
type Category = "Adventure" | "Fairy Tale" | "Science" | "Moral";

type GenerateStoryRequest = {
  email?: string;
  idea?: string;
  title?: string;
  ageGroup: AgeGroup;
  category: Category;
  character?: string;
  setting?: string;
  magicalObject?: string;
  mood?: string;
  lesson?: string;
  pageCount?: number;
};

const ABACUS_URL = process.env.ABACUS_BASE_URL || "https://routellm.abacus.ai/v1/chat/completions";
const TEXT_MODEL = process.env.ABACUS_MODEL || "route-llm";
const IMAGE_MODEL = process.env.ABACUS_IMAGE_MODEL || "nano_banana2";
const IMAGE_RESOLUTION = process.env.ABACUS_IMAGE_RESOLUTION || "512";
const STORAGE_BUCKET = "story-images";

let bucketChecked = false;

async function persistIllustrationUrl(rawUrl: string, pageNumber: number): Promise<string> {
  if (!rawUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return rawUrl;
  }

  try {
    if (!bucketChecked) {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const exists = buckets?.some((b) => b.name === STORAGE_BUCKET);
      if (!exists) {
        await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, { public: true });
      }
      bucketChecked = true;
    }

    let buffer: Buffer;
    let contentType = "image/png";

    if (rawUrl.startsWith("data:")) {
      const match = rawUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return rawUrl;
      contentType = match[1] || "image/png";
      buffer = Buffer.from(match[2], "base64");
    } else {
      const res = await fetch(rawUrl);
      if (!res.ok) return rawUrl;
      contentType = res.headers.get("content-type") || "image/png";
      buffer = Buffer.from(await res.arrayBuffer());
    }

    const ext = contentType.includes("jpeg") || contentType.includes("jpg")
      ? "jpg"
      : contentType.includes("webp")
      ? "webp"
      : "png";
    const filePath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-p${pageNumber}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, { contentType, upsert: false });

    if (uploadError) {
      return rawUrl;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || rawUrl;
  } catch {
    return rawUrl;
  }
}

function cleanJsonText(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function ageInstructions(age: AgeGroup) {
  if (age === "3-5") {
    return `Use very simple vocabulary. Use short sentences. Use gentle humor. Use about 25-45 words per page. Keep everything warm and easy to understand.`;
  }
  if (age === "9-12") {
    return `Use richer but child-friendly vocabulary. Use natural dialogue. Use about 70-110 words per page. Allow mystery and emotional depth while remaining age appropriate.`;
  }
  return `Use simple imaginative language. Use natural dialogue. Use about 45-75 words per page. Make the adventure exciting and easy to follow.`;
}

function categoryInstructions(category: Category) {
  switch (category) {
    case "Adventure":
      return `Give the hero a clear goal, a challenge, a surprising discovery, a clever solution, and a happy ending.`;
    case "Fairy Tale":
      return `Create a charming magical world with one memorable magical element and a warm ending based on kindness, courage, creativity, or friendship.`;
    case "Science":
      return `Teach one real scientific idea naturally through the adventure. Keep the science accurate for the child's age.`;
    case "Moral":
      return `Show a meaningful lesson through the characters' choices and experiences. Do not preach.`;
  }
}

async function callAbacus(payload: Record<string, unknown>, timeoutMs = 120_000) {
  const apiKey = process.env.ABACUS_API_KEY;
  if (!apiKey) {
    throw new Error("ABACUS_API_KEY is missing. Add it to .env.local.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(ABACUS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function generateIllustration(args: {
  pageText: string;
  pageNumber: number;
  storyTitle: string;
  character: string;
  setting: string;
  magicalObject: string;
  mood: string;
  ageGroup: AgeGroup;
}) {
  const prompt = `
Create a beautiful children's storybook illustration.
Story title: ${args.storyTitle}
Main character: ${args.character}
World/setting: ${args.setting}
Magical object: ${args.magicalObject}
Mood: ${args.mood}
Age: ${args.ageGroup}
Page: ${args.pageNumber}

PAGE SCENE:
${args.pageText}

VISUAL STYLE:
- premium children's picture-book illustration, colorful, warm, whimsical, friendly
- expressive characters, soft painterly/digital illustration, clear focal point
- child-safe, cheerful, no written words, no letters, no watermark
- landscape 4:3 composition
`;

  const response = await callAbacus(
    {
      model: IMAGE_MODEL,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image"],
      image_config: {
        num_images: 1,
        aspect_ratio: "4:3",
        resolution: IMAGE_RESOLUTION,
      },
    },
    180_000
  );

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Illustration ${args.pageNumber} failed: ${responseText.slice(0, 300)}`);
  }

  const data = JSON.parse(responseText);
  const image = data?.choices?.[0]?.message?.images?.find((item: any) => item?.type === "image_url");
  const url = image?.image_url?.url;

  if (!url) {
    throw new Error(`Illustration ${args.pageNumber} returned no image URL.`);
  }

  return await persistIllustrationUrl(url as string, args.pageNumber);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateStoryRequest;
    const sessionEmail = await getAuthenticatedEmail();

    if (!sessionEmail) {
      return NextResponse.json({ error: "Please sign in before creating a story." }, { status: 401 });
    }

    const email = sessionEmail.toLowerCase();

    /* -----------------------------------------------------
       CREDIT CHECK IN SUPABASE
    ----------------------------------------------------- */
    const { data: parentRecord, error: parentError } = await supabaseAdmin
      .from("parents")
      .select("credits")
      .eq("email", email)
      .maybeSingle();

    if (parentError || !parentRecord) {
      return NextResponse.json({ error: "Account not found. Please log in first." }, { status: 404 });
    }

    const currentCredits = parentRecord.credits ?? 0;
    if (currentCredits <= 0) {
      return NextResponse.json(
        {
          error: "You have 0 Magic Sparks (Credits) left! Refill your credits in the Parents dashboard to create more stories.",
          insufficientCredits: true,
          credits: 0,
        },
        { status: 403 }
      );
    }

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */
    const validAgeGroups: AgeGroup[] = ["3-5", "6-8", "9-12"];
    const validCategories: Category[] = ["Adventure", "Fairy Tale", "Science", "Moral"];

    if (!validAgeGroups.includes(body.ageGroup) || !validCategories.includes(body.category)) {
      return NextResponse.json({ error: "Choose an age group and story type first." }, { status: 400 });
    }

    const pageCount = Math.min(
      Math.max(
        body.pageCount || (body.ageGroup === "3-5" ? 6 : body.ageGroup === "9-12" ? 8 : 7),
        3
      ),
      8
    );

    const idea = safeString(body.idea, "A little explorer discovers something wonderful and helps a new friend.");
    const character = safeString(body.character, "a curious little explorer");
    const setting = safeString(body.setting, "a colorful magical world");
    const magicalObject = safeString(body.magicalObject, "a tiny glowing compass");
    const mood = safeString(body.mood, "Funny and magical");
    const lesson = safeString(body.lesson, "being curious, kind, brave, and helping others");
    const requestedTitle = safeString(body.title);

    /* -----------------------------------------------------
       TEXT GENERATION
    ----------------------------------------------------- */
    const systemPrompt = `
You are Storyland's professional children's story writer.
Create ORIGINAL, warm, funny, imaginative stories for children.
RULES:
- Never copy copyrighted characters.
- Exactly ${pageCount} pages.
- Every page must naturally continue from the previous page.
- Final page must have a proper happy ending.
- No scary or violent themes.
AGE GUIDANCE:
${ageInstructions(body.ageGroup)}
CATEGORY:
${categoryInstructions(body.category)}

Return ONLY valid JSON:
{
  "title": "A creative title",
  "description": "One short sentence",
  "pages": [
    { "text": "Page text" }
  ]
}
`;

    const userPrompt = `
Create a ${body.category} story for children ages ${body.ageGroup}.
Idea: ${idea}
Character: ${character}
Setting: ${setting}
Object: ${magicalObject}
Mood: ${mood}
Lesson: ${lesson}
${requestedTitle ? `Use this exact title: ${requestedTitle}` : "Invent a fun title."}
Create exactly ${pageCount} pages.
`;

    const textResponse = await callAbacus(
      {
        model: TEXT_MODEL,
        temperature: 0.85,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      },
      120_000
    );

    const textResponseBody = await textResponse.text();
    if (!textResponse.ok) {
      console.error("Abacus text error:", textResponseBody);
      return NextResponse.json({ error: "The story AI could not be reached. Please try again." }, { status: 502 });
    }

    const result = JSON.parse(textResponseBody);
    const rawContent = result?.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("The story AI returned an empty response.");

    const parsed = JSON.parse(cleanJsonText(rawContent));
    if (!parsed?.title || !Array.isArray(parsed.pages)) throw new Error("Invalid story structure returned by AI.");

    const pages = parsed.pages
      .slice(0, pageCount)
      .map((p: any) => ({ text: safeString(p?.text) }))
      .filter((p: { text: string }) => p.text);

    /* -----------------------------------------------------
       IMAGE GENERATION
    ----------------------------------------------------- */
    const imageUrls: string[] = new Array(pages.length).fill("");
    const concurrency = 2;
    let nextIndex = 0;

    async function imageWorker() {
      while (true) {
        const index = nextIndex++;
        if (index >= pages.length) return;

        try {
          imageUrls[index] = await generateIllustration({
            pageText: pages[index].text,
            pageNumber: index + 1,
            storyTitle: safeString(parsed.title),
            character,
            setting,
            magicalObject,
            mood,
            ageGroup: body.ageGroup,
          });
        } catch (imageErr) {
          console.error(`Illustration ${index + 1} failed:`, imageErr);
          imageUrls[index] = "";
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, pages.length) }, () => imageWorker())
    );

    /* -----------------------------------------------------
       DEDUCT 1 CREDIT AFTER SUCCESS
    ----------------------------------------------------- */
    const updatedCredits = Math.max(0, currentCredits - 1);
    await supabaseAdmin.from("parents").update({ credits: updatedCredits }).eq("email", email);

    return NextResponse.json({
      story: {
        title: safeString(parsed.title),
        description: safeString(parsed.description),
        pages: pages.map((page: { text: string }, index: number) => ({
          id: index + 1,
          text: page.text,
          imageUrl: imageUrls[index],
        })),
      },
      remainingCredits: updatedCredits,
    });
  } catch (error) {
    console.error("Generate story error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong while creating the story." },
      { status: 500 }
    );
  }
}
