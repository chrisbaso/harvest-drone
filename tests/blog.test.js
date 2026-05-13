import assert from "node:assert/strict";
import {
  BLOG_CATEGORY_FILTERS,
  BLOG_DEFAULT_CONTENT_LIBRARY,
  buildBlogEditorSeedFromCalendarItem,
  buildBlogDraftInsert,
  buildSitemapXml,
  createBlogSlug,
  getBlogCategoryLabel,
  getBlogCtaConfig,
  getNextPlannedBlogTopics,
} from "../shared/blog.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("creates clean blog slugs capped at 80 characters", () => {
  assert.equal(
    createBlogSlug("Why Your Nitrogen Bill Keeps Going Up — And What One Ounce Can Do About It"),
    "why-your-nitrogen-bill-keeps-going-up-and-what-one-ounce-can-do-about-it",
  );
  assert.equal(createBlogSlug("  SOURCE vs. Anhydrous: The $15/Acre Math!  "), "source-vs-anhydrous-the-15-acre-math");
  assert.equal(createBlogSlug(""), "untitled-post");
  assert.ok(createBlogSlug("A".repeat(120)).length <= 80);
});

run("maps blog categories to farmer-facing filter labels", () => {
  assert.equal(getBlogCategoryLabel("pain-points"), "Input Costs");
  assert.equal(getBlogCategoryLabel("product-education"), "Product Education");
  assert.equal(getBlogCategoryLabel("proof-results"), "Field Results");
  assert.equal(getBlogCategoryLabel("industry-regulatory"), "Industry & Regulatory");
  assert.equal(getBlogCategoryLabel("unknown"), "Insights");
  assert.ok(BLOG_CATEGORY_FILTERS.some((filter) => filter.value === "all" && filter.label === "All"));
});

run("resolves configured CTA defaults by type", () => {
  assert.deepEqual(getBlogCtaConfig({ cta_type: "roi-calculator" }), {
    label: "Run the ROI calculator",
    text: "Run the ROI calculator",
    url: "/roi-calculator",
  });
  assert.deepEqual(getBlogCtaConfig({ cta_text: "Talk to Jake", cta_url: "/enterprise", cta_type: "enterprise-contact" }), {
    label: "Talk to Jake",
    text: "Talk to Jake",
    url: "/enterprise",
  });
  assert.equal(getBlogCtaConfig({ cta_type: "none" }), null);
});

run("builds review-state blog draft inserts from generated content", () => {
  const now = "2026-05-12T11:00:00.000Z";
  const draft = buildBlogDraftInsert({
    calendarItem: {
      title: "SOURCE vs Anhydrous Ammonia: The Per-Acre Math",
      category: "product-education",
      brief: "Compare costs.",
      target_keywords: ["SOURCE vs anhydrous"],
    },
    generated: {
      title: "SOURCE vs Anhydrous Ammonia: The Per-Acre Math",
      subtitle: "A straight per-acre comparison.",
      meta_description: "SOURCE vs anhydrous: compare per-acre nitrogen cost, yield data, and when the math works for corn acres.",
      excerpt: "A practical comparison for corn growers.",
      body: "## The math\n\nSOURCE costs **$15/acre**.",
      tags: ["source", "nitrogen"],
      reading_time_minutes: 4,
      word_count: 920,
    },
    now,
  });

  assert.equal(draft.slug, "source-vs-anhydrous-ammonia-the-per-acre-math");
  assert.equal(draft.status, "review");
  assert.equal(draft.ai_generated, true);
  assert.equal(draft.ai_model, "gpt-4o-mini");
  assert.equal(draft.ai_generated_at, now);
  assert.equal(draft.cta_type, "acre-plan");
  assert.deepEqual(draft.tags, ["source", "nitrogen"]);
});

run("selects next planned content-library topics by priority", () => {
  const topics = getNextPlannedBlogTopics(
    [
      { id: "draft", title: "Already generated", status: "draft", priority: 1 },
      { id: "slow", title: "Lower priority", status: "planned", priority: 5 },
      { id: "fast", title: "High priority", status: "planned", priority: 1 },
      { id: "medium", title: "Medium priority", status: "planned", priority: 3 },
    ],
    2,
  );

  assert.deepEqual(topics.map((topic) => topic.id), ["fast", "medium"]);
});

run("ships with a default content library for local and empty-database use", () => {
  assert.ok(BLOG_DEFAULT_CONTENT_LIBRARY.length >= 20);
  assert.ok(BLOG_DEFAULT_CONTENT_LIBRARY.every((topic) => topic.status === "planned"));
  assert.ok(BLOG_DEFAULT_CONTENT_LIBRARY.every((topic) => topic.title && topic.brief && topic.target_keywords?.length));
  assert.equal(BLOG_DEFAULT_CONTENT_LIBRARY[0].priority, 1);
});

run("turns a planned calendar topic into an editor-ready seed", () => {
  const seed = buildBlogEditorSeedFromCalendarItem({
    title: "What Does Drone Spraying Actually Cost Per Acre?",
    category: "product-education",
    target_keywords: ["drone spraying cost per acre", "ag drone application pricing"],
    brief: "Transparent breakdown: $8-14/acre depending on field size.",
  });

  assert.equal(seed.title, "What Does Drone Spraying Actually Cost Per Acre?");
  assert.equal(seed.category, "product-education");
  assert.deepEqual(seed.tags, ["drone spraying cost per acre", "ag drone application pricing"]);
  assert.equal(seed.excerpt, "Transparent breakdown: $8-14/acre depending on field size.");
  assert.equal(seed.status, "draft");
});

run("escapes sitemap XML and includes static plus blog URLs", () => {
  const xml = buildSitemapXml({
    baseUrl: "https://harvest-drone.vercel.app",
    staticPages: [{ url: "/blog", priority: "0.9", changefreq: "daily" }],
    blogPosts: [{ slug: "source-5-acre", updated_at: "2026-05-12T14:30:00.000Z" }],
  });

  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<loc>https:\/\/harvest-drone\.vercel\.app\/blog<\/loc>/);
  assert.match(xml, /<loc>https:\/\/harvest-drone\.vercel\.app\/blog\/source-5-acre<\/loc>/);
  assert.match(xml, /<lastmod>2026-05-12<\/lastmod>/);
  assert.equal(xml.includes("& "), false);
});
