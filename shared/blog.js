export const BLOG_BASE_URL = "https://harvest-drone.vercel.app";

export const BLOG_CATEGORY_LABELS = {
  "pain-points": "Input Costs",
  "product-education": "Product Education",
  "proof-results": "Field Results",
  "industry-regulatory": "Industry & Regulatory",
  insights: "Insights",
};

export const BLOG_CATEGORY_FILTERS = [
  { label: "All", value: "all" },
  { label: "Input Costs", value: "pain-points" },
  { label: "Product Education", value: "product-education" },
  { label: "Field Results", value: "proof-results" },
  { label: "Industry & Regulatory", value: "industry-regulatory" },
];

export const BLOG_STATIC_SITEMAP_PAGES = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/growers", priority: "0.9", changefreq: "weekly" },
  { url: "/operators", priority: "0.8", changefreq: "monthly" },
  { url: "/hylio", priority: "0.8", changefreq: "monthly" },
  { url: "/demo-day", priority: "0.8", changefreq: "monthly" },
  { url: "/training/enroll", priority: "0.8", changefreq: "monthly" },
  { url: "/source", priority: "0.9", changefreq: "weekly" },
  { url: "/enterprise", priority: "0.8", changefreq: "monthly" },
  { url: "/roi-calculator", priority: "0.8", changefreq: "monthly" },
  { url: "/blog", priority: "0.9", changefreq: "daily" },
  { url: "/how-it-works", priority: "0.7", changefreq: "monthly" },
];

export const BLOG_DEFAULT_CONTENT_LIBRARY = [
  {
    id: "library-nitrogen-bill-one-ounce",
    title: "Why Your Nitrogen Bill Keeps Going Up - And What One Ounce Can Do About It",
    category: "pain-points",
    target_keywords: ["nitrogen fertilizer cost", "reduce nitrogen spend", "anhydrous ammonia alternative"],
    brief: "Lead with the pain of rising nitrogen costs. Introduce SOURCE as a $15/acre synthetic activator where one ounce replaces 25 lbs of N. End with the acre plan CTA.",
    priority: 1,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-ground-rig-compaction",
    title: "The Hidden Cost of Ground Rig Compaction on Your Yield",
    category: "pain-points",
    target_keywords: ["soil compaction yield loss", "ground rig damage crops", "drone spraying vs ground rig"],
    brief: "Explain how late-season ground rig passes compact soil and damage crops. Quantify yield loss per compaction event. Position drone application as the alternative.",
    priority: 2,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-minnesota-corn-input-costs",
    title: "6 Ways Minnesota Corn Growers Are Cutting Input Costs in 2026",
    category: "pain-points",
    target_keywords: ["reduce farm input costs", "Minnesota corn farming", "cut fertilizer costs"],
    brief: "Listicle format. Include SOURCE as item #1 with specific savings data. Cover precision application, soil testing, variable rate, cover crops, and timing optimization.",
    priority: 2,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-missed-spray-window",
    title: "Missed Your Spray Window? Here Is What It Actually Cost You",
    category: "pain-points",
    target_keywords: ["missed spray window cost", "fungicide timing potatoes", "late blight potato loss"],
    brief: "Quantify the cost of missed spray windows on potatoes and corn. Position drone capability as the solution - spray when ground rigs cannot access the field.",
    priority: 3,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-cut-25-lbs-n",
    title: "What Happens When You Cut 25 lbs of Synthetic N Per Acre",
    category: "pain-points",
    target_keywords: ["reduce synthetic nitrogen", "nitrogen reduction farming", "SOURCE soil activator"],
    brief: "Walk through the biology: what SOURCE actually does in the soil, how microbes deliver N, why one ounce replaces 25 lbs. Data-driven, not marketing language.",
    priority: 2,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-hylio-ag272-pricing",
    title: "How Much Does a Hylio AG-272 Actually Cost? Full Pricing Breakdown",
    category: "product-education",
    target_keywords: ["Hylio AG-272 price", "ag drone cost", "Hylio drone pricing"],
    brief: "Transparent pricing: $56K drone only, $72K full kit, $1,500 training, $4K annual maintenance. Compare to DJI Agras, hiring applicators, and the Hylio payback calculator.",
    priority: 1,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-hylio-operator-training-checklist",
    title: "The Complete Hylio Operator Training Checklist: What You Need Before Your First Flight",
    category: "product-education",
    target_keywords: ["Hylio training", "ag drone pilot training", "drone operator certification"],
    brief: "Walk through Part 107, Part 137, pesticide license, and the Harvest Drone certification program. Show the full training path from zero experience to field-ready operator.",
    priority: 1,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-source-vs-anhydrous",
    title: "SOURCE vs Anhydrous Ammonia: The Per-Acre Math",
    category: "product-education",
    target_keywords: ["SOURCE vs anhydrous", "SOURCE Sound Agriculture", "nitrogen replacement product"],
    brief: "Side-by-side cost comparison. SOURCE at $15/acre vs anhydrous at current market prices. Show the math on 500, 1000, and 2000 acre operations. Include yield lift data.",
    priority: 1,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-drone-spraying-cost",
    title: "What Does Drone Spraying Actually Cost Per Acre?",
    category: "product-education",
    target_keywords: ["drone spraying cost per acre", "ag drone application pricing", "drone vs airplane spraying"],
    brief: "Transparent breakdown: $8-14/acre depending on field size, product, and logistics. Compare to ground rig and aerial applicator costs. Include when drone makes sense and when it does not.",
    priority: 1,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-earthoptics-soil-scanning",
    title: "EarthOptics Soil Scanning: What It Shows and Why It Matters",
    category: "product-education",
    target_keywords: ["EarthOptics soil scanning", "subsurface soil mapping", "precision agriculture soil data"],
    brief: "Explain what EarthOptics reveals that satellite imagery cannot - compaction, drainage, nutrient variability below the surface. How prescription maps drive targeted application.",
    priority: 3,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-source-not-biological",
    title: "SOURCE Is Not a Biological - Here Is Why That Matters",
    category: "product-education",
    target_keywords: ["SOURCE synthetic vs biological", "Sound Agriculture SOURCE", "soil activator synthetic"],
    brief: "Address the most common misconception. SOURCE is synthetic with an ultra-low use rate. Explain why this means consistent performance regardless of soil biology conditions.",
    priority: 2,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-source-corn-guide",
    title: "The Complete Guide to Applying SOURCE on Corn",
    category: "product-education",
    target_keywords: ["SOURCE application corn", "SOURCE foliar spray", "how to apply SOURCE"],
    brief: "Practical application guide. Timing, rate, tank mix compatibility, carrier volume, check strip methodology. Written for the farmer who just bought SOURCE and wants to apply it correctly.",
    priority: 3,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-million-acres-source-results",
    title: "First-Season SOURCE Results: What 1 Million Acres of Data Shows",
    category: "proof-results",
    target_keywords: ["SOURCE results data", "SOURCE yield improvement", "Sound Agriculture field trials"],
    brief: "Pull from Sound Agriculture published data: 84% win rate on corn, 6-12 bushel yield improvements, 150% net retention. Position these as industry data, not Harvest Drone claims.",
    priority: 1,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-1400-acre-minnesota-case-study",
    title: "How a 1,400-Acre Minnesota Corn Operation Cut $30/Acre Off Urea",
    category: "proof-results",
    target_keywords: ["SOURCE case study Minnesota", "reduce urea cost corn", "SOURCE farmer results"],
    brief: "Case study format. Walk through the operation, the decision to try SOURCE, the trial methodology, and the harvest results. Include the expansion decision for next season.",
    priority: 2,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-drone-vs-ground-rig",
    title: "Drone Application vs Ground Rig: A Side-by-Side Field Comparison",
    category: "proof-results",
    target_keywords: ["drone vs ground rig comparison", "drone spraying advantages", "precision application drone"],
    brief: "Compare compaction, coverage uniformity, speed, wet field access, crop damage, and cost. Use real field data where available. Honest about where ground rigs still win.",
    priority: 2,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-source-all-acres",
    title: "Why Growers Who Try SOURCE Put It on All Their Acres",
    category: "proof-results",
    target_keywords: ["SOURCE repeat purchase", "SOURCE grower retention", "SOURCE expand acres"],
    brief: "Explain the 150% net retention rate. The pattern: trial on partial acres, compare at harvest, expand. Include grower perspectives and end with the free acre plan CTA.",
    priority: 2,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-dji-ban-2027-ag-drone-operators",
    title: "DJI Ban 2027: What Ag Drone Operators Need to Do Now",
    category: "industry-regulatory",
    target_keywords: ["DJI ban agriculture 2027", "American made drone requirement", "replace DJI ag drone"],
    brief: "The timeline, regulation details, and what operators should do today. Position Hylio as the compliant alternative and Harvest Drone as the transition partner.",
    priority: 1,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-2027-drone-regulations",
    title: "2027 Drone Regulations: What Every Ag Operation Needs to Know",
    category: "industry-regulatory",
    target_keywords: ["2027 ag drone regulations", "American made drone requirement", "DJI ban agriculture"],
    brief: "Explain the upcoming American-made mandate. What it means for operations currently using DJI. Why Hylio is positioned as the compliant alternative. Timeline for compliance.",
    priority: 1,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-part-107-minnesota-guide",
    title: "Part 107 for Ag Drone Pilots: The Complete Minnesota Guide",
    category: "industry-regulatory",
    target_keywords: ["Part 107 agriculture Minnesota", "drone pilot license farming", "FAA Part 107 ag drone"],
    brief: "Step-by-step guide to getting Part 107 certified. Cost, study materials, test locations in Minnesota, renewal requirements. Position Harvest Drone training program as prep resource.",
    priority: 2,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-rup-drone-requirements",
    title: "Restricted-Use Pesticide Application by Drone: State Requirements",
    category: "industry-regulatory",
    target_keywords: ["drone pesticide application license", "restricted use pesticide drone", "pesticide applicator license drone"],
    brief: "State-by-state overview focusing on Minnesota, North Dakota, South Dakota, Wisconsin. What licenses are needed beyond Part 107.",
    priority: 3,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-sound-agriculture-growth",
    title: "How Sound Agriculture Went From Startup to 1 Million Acres",
    category: "industry-regulatory",
    target_keywords: ["Sound Agriculture company", "Sound Agriculture growth", "SOURCE product history"],
    brief: "Company profile of Sound Agriculture. Founding, product development, field trial results, growth trajectory. Positions Harvest Drone as a distribution partner of a proven company.",
    priority: 4,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-farm-drone-division",
    title: "Building a Drone Division Inside Your Farm Operation",
    category: "industry-regulatory",
    target_keywords: ["build drone division farm", "own vs hire drone spraying", "enterprise drone agriculture"],
    brief: "The case for owning drone capability vs hiring applicators. ROI model, staffing requirements, training needs, regulatory compliance. Link to the ROI calculator.",
    priority: 1,
    status: "planned",
    isLocalLibrary: true,
  },
  {
    id: "library-ag-imo-model",
    title: "The Ag IMO Model: How Distribution Networks Work in Precision Agriculture",
    category: "industry-regulatory",
    target_keywords: ["ag distribution network", "precision agriculture distribution", "IMO model agriculture"],
    brief: "Explain the distribution model. Hub manages systems, training, compliance, and demand. Dealers/operators service local territories.",
    priority: 4,
    status: "planned",
    isLocalLibrary: true,
  },
];

const CTA_DEFAULTS = {
  "acre-plan": {
    label: "Get your free acre plan",
    text: "Get your free acre plan",
    url: "/growers#grower-acre-plan-form",
  },
  "roi-calculator": {
    label: "Run the ROI calculator",
    text: "Run the ROI calculator",
    url: "/roi-calculator",
  },
  "enterprise-contact": {
    label: "Talk to Harvest Drone",
    text: "Talk to Harvest Drone",
    url: "/enterprise",
  },
};

export function createBlogSlug(title, fallback = "untitled-post") {
  const slug = String(title || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80)
    .replace(/-+$/g, "");

  return slug || fallback;
}

export function getBlogCategoryLabel(category) {
  return BLOG_CATEGORY_LABELS[category] || BLOG_CATEGORY_LABELS.insights;
}

export function getBlogCtaConfig(post = {}) {
  if (post.cta_type === "none") {
    return null;
  }

  const defaults = CTA_DEFAULTS[post.cta_type] || CTA_DEFAULTS["acre-plan"];
  const text = post.cta_text || defaults.text;
  const url = post.cta_url || defaults.url;

  return {
    label: text,
    text,
    url,
  };
}

export function getDefaultBlogCtaType(category) {
  return category === "industry-regulatory" ? "roi-calculator" : "acre-plan";
}

export function getNextPlannedBlogTopics(calendarItems = [], limit = 3) {
  return [...calendarItems]
    .filter((item) => item?.status === "planned")
    .sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5) || String(a.title || "").localeCompare(String(b.title || "")))
    .slice(0, limit);
}

export function buildBlogEditorSeedFromCalendarItem(item = {}) {
  return {
    title: item.title || "",
    category: item.category || "insights",
    tags: normalizeBlogTags(item.target_keywords),
    excerpt: item.brief || "",
    status: "draft",
  };
}

export function normalizeBlogTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function estimateReadingTimeMinutes(body = "") {
  const wordCount = String(body).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 250));
}

export function normalizeMetaDescription(description) {
  const value = String(description || "").trim();
  return value.length > 155 ? value.slice(0, 152).trimEnd() + "..." : value || null;
}

export function buildBlogDraftInsert({ calendarItem, generated = {}, now = new Date().toISOString() }) {
  const title = generated.title || calendarItem.title;
  const body = generated.body || "";
  const wordCount = generated.word_count || body.trim().split(/\s+/).filter(Boolean).length;

  return {
    slug: createBlogSlug(title),
    title,
    subtitle: generated.subtitle || null,
    meta_title: generated.title || calendarItem.title,
    meta_description: normalizeMetaDescription(generated.meta_description),
    body,
    excerpt: generated.excerpt || null,
    category: calendarItem.category || "insights",
    tags: normalizeBlogTags(generated.tags?.length ? generated.tags : calendarItem.target_keywords),
    status: "review",
    author_name: "Jake Lund",
    author_role: "Founder, Harvest Drone",
    ai_generated: true,
    ai_prompt: calendarItem.brief || calendarItem.title,
    ai_model: "gpt-4o-mini",
    ai_generated_at: now,
    reading_time_minutes: generated.reading_time_minutes || estimateReadingTimeMinutes(body),
    word_count: wordCount,
    cta_type: getDefaultBlogCtaType(calendarItem.category),
  };
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatLastMod(value) {
  return value ? String(value).split("T")[0] : null;
}

export function buildSitemapXml({ baseUrl = BLOG_BASE_URL, staticPages = BLOG_STATIC_SITEMAP_PAGES, blogPosts = [] }) {
  const blogPages = blogPosts.map((post) => ({
    url: `/blog/${post.slug}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: formatLastMod(post.updated_at),
  }));
  const allPages = [...staticPages, ...blogPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${escapeXml(`${baseUrl}${page.url}`)}</loc>
    <priority>${escapeXml(page.priority)}</priority>
    <changefreq>${escapeXml(page.changefreq)}</changefreq>${page.lastmod ? `
    <lastmod>${escapeXml(page.lastmod)}</lastmod>` : ""}
  </url>`,
  )
  .join("\n")}
</urlset>`;
}
