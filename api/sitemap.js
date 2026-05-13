import { BLOG_BASE_URL, BLOG_STATIC_SITEMAP_PAGES, buildSitemapXml } from "../shared/blog.js";
import { getSupabaseServerClient } from "./_lib/serverSupabase.js";

export default async function handler(_req, res) {
  let posts = [];

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      throw error;
    }

    posts = data || [];
  } catch (error) {
    console.warn("Unable to load blog posts for sitemap", error.message);
  }

  const sitemap = buildSitemapXml({
    baseUrl: BLOG_BASE_URL,
    staticPages: BLOG_STATIC_SITEMAP_PAGES,
    blogPosts: posts,
  });

  res.setHeader("Content-Type", "application/xml");
  return res.status(200).send(sitemap);
}
