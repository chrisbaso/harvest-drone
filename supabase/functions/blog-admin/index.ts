import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey",
};

const SYSTEM_PROMPT = `You are a content writer for Harvest Drone, a precision agriculture company in Minnesota. Write practical, specific, data-driven blog posts for farmers.

Rules:
1. SOURCE is a synthetic soil activator, not a biological. One ounce replaces 25 lbs of nitrogen. It costs $15/acre.
2. BLUEPRINT is $11/acre. SOURCE + BLUEPRINT is $25/acre, or $23/acre with Harvest Drone drone application.
3. Sound Agriculture reports an 84% corn win rate, 6-12 bushel yield improvements, 150% net retention, and 1M+ US acres.
4. Drone application costs $8-14/acre, creates zero compaction, and can be 3-5x faster than ground rigs.
5. Write like a practical Minnesota ag operator: short paragraphs, useful numbers, no marketing fluff.
6. Use markdown with ## headings, **bold** emphasis, and - bullets.
7. Include 2-3 internal links to /growers, /source, /roi-calculator, or related blog URLs.

Respond with JSON only:
{
  "title": "...",
  "subtitle": "...",
  "meta_description": "...",
  "excerpt": "...",
  "body": "...",
  "tags": ["tag1", "tag2"],
  "reading_time_minutes": 5,
  "word_count": 1100
}`;

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message || "Blog admin action failed.");
  }
  return "Blog admin action failed.";
}

function createSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function countWords(value: string) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function readingTime(value: string) {
  return Math.max(1, Math.ceil(countWords(value) / 250));
}

function normalizeMetaDescription(value: unknown) {
  const text = String(value || "").trim();
  return text.length > 155 ? text.slice(0, 152).trimEnd() + "..." : text;
}

async function assertAdmin(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!token || token.startsWith("sb_")) {
    throw new Error("Admin authentication required.");
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userResult?.user) {
    throw new Error("Admin authentication required.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userResult.user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    throw new Error("Admin role required.");
  }
}

function buildSavePayload(input: Record<string, unknown>, publish = false) {
  const body = String(input.body || "");
  const status = publish ? "published" : String(input.status || "draft");
  const publishedAt = publish
    ? String(input.published_at || new Date().toISOString())
    : status === "published"
      ? String(input.published_at || new Date().toISOString())
      : input.published_at || null;

  return {
    slug: String(input.slug || createSlug(String(input.title || ""))),
    title: String(input.title || "").trim(),
    subtitle: input.subtitle || null,
    category: input.category || "insights",
    tags: normalizeTags(input.tags),
    meta_title: input.meta_title || input.title || null,
    meta_description: normalizeMetaDescription(input.meta_description),
    excerpt: input.excerpt || null,
    body,
    cta_type: input.cta_type || "acre-plan",
    cta_text: input.cta_text || "Get your free acre plan ->",
    cta_url: input.cta_url || "/growers#grower-acre-plan-form",
    author_name: input.author_name || "Jake Lund",
    author_role: input.author_role || "Founder, Harvest Drone",
    status,
    published_at: publishedAt,
    reading_time_minutes: Number(input.reading_time_minutes || readingTime(body)),
    word_count: Number(input.word_count || countWords(body)),
    human_reviewed: publish ? true : Boolean(input.human_reviewed),
    human_reviewed_by: publish ? input.human_reviewed_by || "Harvest Drone admin" : input.human_reviewed_by || null,
    human_reviewed_at: publish ? new Date().toISOString() : input.human_reviewed_at || null,
    ai_generated: Boolean(input.ai_generated),
    ai_prompt: input.ai_prompt || null,
    ai_model: input.ai_model || null,
    ai_generated_at: input.ai_generated_at || null,
  };
}

async function savePost(input: Record<string, unknown>, publish = false) {
  const payload = buildSavePayload(input, publish);

  if (!payload.title) {
    throw new Error("Title is required.");
  }

  const query = input.id
    ? supabase.from("blog_posts").update(payload).eq("id", input.id).select().single()
    : supabase.from("blog_posts").insert(payload).select().single();

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function generateArticle(input: Record<string, unknown>) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const title = String(input.title || "").trim();
  const category = String(input.category || "insights");
  const brief = String(input.brief || input.excerpt || "Use the title as the guide.");
  const keywords = normalizeTags(input.keywords || input.tags).join(", ") || "infer from the title";

  if (!title) {
    throw new Error("Title is required.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Write a blog post for Minnesota growers.
Title: ${title}
Category: ${category}
Brief: ${brief}
Target keywords: ${keywords}`,
        },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI generation failed.");
  }

  const content = String(data.choices?.[0]?.message?.content || "")
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(content);
}

function buildGeneratedPost(input: Record<string, unknown>, generated: Record<string, unknown>) {
  const body = String(generated.body || input.body || "");
  const now = new Date().toISOString();

  return {
    ...input,
    slug: input.slug || createSlug(String(generated.title || input.title || "")),
    title: generated.title || input.title,
    subtitle: generated.subtitle || input.subtitle || null,
    meta_title: generated.title || input.meta_title || input.title,
    meta_description: normalizeMetaDescription(generated.meta_description || input.meta_description),
    excerpt: generated.excerpt || input.excerpt || null,
    body,
    category: input.category || "insights",
    tags: normalizeTags(Array.isArray(generated.tags) && generated.tags.length ? generated.tags : input.tags),
    status: "review",
    author_name: input.author_name || "Jake Lund",
    author_role: input.author_role || "Founder, Harvest Drone",
    ai_generated: true,
    ai_prompt: input.brief || input.excerpt || input.title || null,
    ai_model: "gpt-4o-mini",
    ai_generated_at: now,
    reading_time_minutes: generated.reading_time_minutes || readingTime(body),
    word_count: generated.word_count || countWords(body),
    cta_type: input.cta_type || "acre-plan",
    cta_text: input.cta_text || "Get your free acre plan ->",
    cta_url: input.cta_url || "/growers#grower-acre-plan-form",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    await assertAdmin(req);
    const body = await req.json();

    if (body.action === "list") {
      const [postsResult, calendarResult] = await Promise.all([
        supabase.from("blog_posts").select("*").order("updated_at", { ascending: false }),
        supabase.from("blog_content_calendar").select("*").order("priority", { ascending: true }),
      ]);

      if (postsResult.error) throw postsResult.error;
      if (calendarResult.error) throw calendarResult.error;

      return jsonResponse({ posts: postsResult.data || [], calendar: calendarResult.data || [] });
    }

    if (body.action === "save") {
      const post = await savePost(body.post || {}, Boolean(body.publish));
      return jsonResponse({ post });
    }

    if (body.action === "generate") {
      const source = body.post || body.calendarItem || {};
      const generationInput = {
        ...source,
        brief: source.brief || source.excerpt,
        keywords: source.target_keywords || source.tags,
      };
      const generated = await generateArticle(generationInput);
      const generatedPost = buildGeneratedPost(source, generated);

      if (!body.post?.id) {
        delete (generatedPost as Record<string, unknown>).id;
      }

      const post = await savePost(generatedPost, false);

      if (body.calendarItem?.id && !body.calendarItem?.isLocalLibrary) {
        await supabase
          .from("blog_content_calendar")
          .update({ status: "draft", post_id: post.id })
          .eq("id", body.calendarItem.id);
      }

      return jsonResponse({ generated, post });
    }

    return jsonResponse({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    console.error("blog-admin error", error);
    const message = errorMessage(error);
    const status = /auth|required|role/i.test(message) ? 401 : 500;
    return jsonResponse({ error: message }, { status });
  }
});
