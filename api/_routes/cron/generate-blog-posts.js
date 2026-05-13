import { buildBlogDraftInsert, createBlogSlug } from "../../../shared/blog.js";
import { getSupabaseServerClient } from "../../_lib/serverSupabase.js";

function unauthorized(res) {
  return res.status(401).json({ error: "Unauthorized" });
}

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true;
  }

  const authHeader = req.headers.authorization || "";
  return authHeader === `Bearer ${cronSecret}`;
}

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
}

function isMondayInTimezone(date = new Date(), timezone = "America/Chicago") {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: timezone }).format(date);
  return weekday === "Mon";
}

async function createAvailableSlug(supabase, title, calendarItemId) {
  const baseSlug = createBlogSlug(title);
  const { data: existing } = await supabase.from("blog_posts").select("id").eq("slug", baseSlug).maybeSingle();

  if (!existing) {
    return baseSlug;
  }

  const suffix = String(calendarItemId || Date.now()).replace(/-/g, "").slice(0, 8);
  return `${baseSlug.substring(0, Math.max(1, 79 - suffix.length))}-${suffix}`.replace(/-+/g, "-");
}

async function notifyAdmin(generated) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL || generated.length === 0) {
    return { status: "skipped" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || "notifications@harvestdrone.com",
      to: [process.env.ADMIN_EMAIL],
      subject: `${generated.length} blog drafts ready for review`,
      html: `<h2>${generated.length} new blog posts generated</h2>
        <p>Review and publish at your admin panel:</p>
        <ul>${generated.map((item) => `<li><strong>${item.title}</strong></li>`).join("")}</ul>
        <p>These are AI-generated drafts. Review for accuracy before publishing.</p>`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    return { status: "failed", error: errorText || "Resend notification failed." };
  }

  return { status: "sent" };
}

export async function runBlogPostGeneration({ limit = 3, now = new Date().toISOString() } = {}) {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase URL or service role key for blog generation.");
  }

  const supabase = getSupabaseServerClient();
  const { data: planned, error: plannedError } = await supabase
    .from("blog_content_calendar")
    .select("*")
    .eq("status", "planned")
    .order("priority")
    .limit(limit);

  if (plannedError) {
    throw plannedError;
  }

  if (!planned || planned.length === 0) {
    return { message: "No planned posts to generate", results: [], notification: { status: "skipped" } };
  }

  const results = [];

  for (const item of planned) {
    await supabase.from("blog_content_calendar").update({ status: "generating" }).eq("id", item.id);

    try {
      const generationResponse = await fetch(`${supabaseUrl}/functions/v1/blog-generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: item.title,
          category: item.category,
          brief: item.brief,
          keywords: item.target_keywords,
        }),
      });
      const generated = await generationResponse.json();

      if (!generationResponse.ok || generated.error) {
        throw new Error(generated.error || "Blog generation failed.");
      }

      const draft = buildBlogDraftInsert({ calendarItem: item, generated, now });
      draft.slug = await createAvailableSlug(supabase, draft.title, item.id);

      const { data: post, error: postError } = await supabase.from("blog_posts").insert(draft).select().single();

      if (postError) {
        throw postError;
      }

      await supabase.from("blog_content_calendar").update({ status: "draft", post_id: post.id }).eq("id", item.id);
      results.push({ title: item.title, status: "generated", slug: draft.slug });
    } catch (error) {
      await supabase.from("blog_content_calendar").update({ status: "planned" }).eq("id", item.id);
      results.push({ title: item.title, status: "failed", error: error.message || "Unknown generation error." });
    }
  }

  const generated = results.filter((result) => result.status === "generated");
  const notification = await notifyAdmin(generated);

  return { results, notification };
}

export async function maybeRunWeeklyBlogGeneration({ timezone = "America/Chicago", now = new Date() } = {}) {
  if (!isMondayInTimezone(now, timezone)) {
    return { skipped: true, reason: "Blog generation only runs on Mondays.", timezone };
  }

  return runBlogPostGeneration({ now: now.toISOString() });
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  try {
    const result = await runBlogPostGeneration();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to generate blog posts." });
  }
}
