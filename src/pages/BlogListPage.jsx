import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { supabase } from "../lib/supabase";
import { BLOG_CATEGORY_FILTERS, getBlogCategoryLabel } from "../../shared/blog";

const css = `
.blog-page{--blog-bg:#0C0F0A;--blog-surface:#151A12;--blog-card:#1A2015;--blog-border:rgba(255,255,255,0.07);--blog-border-active:rgba(163,217,119,0.28);--blog-text:#E8E6E1;--blog-muted:#8A927E;--blog-dim:#5F6653;--blog-accent:#A3D977;--blog-accent-soft:rgba(163,217,119,0.08);--blog-accent-med:rgba(163,217,119,0.16);--blog-serif:'DM Serif Display',Georgia,serif;--blog-sans:'Instrument Sans',Manrope,system-ui,sans-serif;--blog-radius:10px;background:var(--blog-bg);color:var(--blog-text);font-family:var(--blog-sans);min-height:100vh;padding:0 0 64px}
.blog-page *{box-sizing:border-box}
.blog-wrap{width:min(1120px,calc(100% - 32px));margin:0 auto}
.blog-hero{padding:72px 0 34px;border-bottom:1px solid var(--blog-border)}
.blog-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:0.72rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--blog-accent);margin-bottom:18px}
.blog-eyebrow::before{content:'';width:24px;height:1px;background:var(--blog-accent)}
.blog-hero h1{font-family:var(--blog-serif);font-size:clamp(2.5rem,7vw,5rem);font-weight:400;line-height:0.98;margin:0;color:#fff;letter-spacing:0}
.blog-hero p{max-width:610px;margin:16px 0 0;color:var(--blog-muted);font-size:1rem;line-height:1.7}
.blog-tabs{display:flex;gap:8px;overflow-x:auto;padding:24px 0 18px}
.blog-tab{border:1px solid var(--blog-border);background:var(--blog-surface);color:var(--blog-muted);border-radius:999px;padding:10px 14px;font-weight:800;font-size:0.82rem;white-space:nowrap;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
.blog-tab:hover,.blog-tab.is-active{background:var(--blog-accent-soft);border-color:var(--blog-border-active);color:var(--blog-text)}
.blog-grid{display:grid;gap:16px}
@media(min-width:760px){.blog-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.blog-card{min-height:280px;display:grid;align-content:space-between;gap:22px;padding:24px;background:var(--blog-surface);border:1px solid var(--blog-border);border-radius:var(--blog-radius);transition:transform .15s,border-color .15s,background .15s}
.blog-card:hover{transform:translateY(-2px);border-color:var(--blog-border-active);background:var(--blog-card)}
.blog-card__top{display:grid;gap:12px}
.blog-badge{display:inline-flex;width:max-content;align-items:center;gap:6px;border:1px solid var(--blog-accent-med);background:var(--blog-accent-soft);color:var(--blog-accent);border-radius:999px;padding:5px 10px;font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase}
.blog-card h2{font-family:var(--blog-serif);font-size:clamp(1.45rem,3vw,2rem);font-weight:400;line-height:1.12;color:#fff;margin:0}
.blog-card p{margin:0;color:rgba(232,230,225,0.82);line-height:1.65}
.blog-card__meta{display:flex;flex-wrap:wrap;gap:8px 14px;color:var(--blog-dim);font-size:0.8rem}
.blog-state{padding:34px 24px;background:var(--blog-surface);border:1px solid var(--blog-border);border-radius:var(--blog-radius);color:var(--blog-muted)}
.blog-state strong{display:block;color:var(--blog-text);font-family:var(--blog-serif);font-size:1.4rem;font-weight:400;margin-bottom:6px}
`;

function formatDate(value) {
  if (!value) return "Draft date";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function setMetaDescription(content) {
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = content;
}

function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Harvest Drone Field Notes";
    setMetaDescription("Practical field notes on nitrogen costs, drone application, SOURCE, and precision agriculture for growers and ag teams.");

    return () => {
      document.title = "Harvest Drone";
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      setStatus("loading");
      const { data, error: postsError } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, category, published_at, reading_time_minutes, author_name, featured_image_url")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!isMounted) return;

      if (postsError) {
        setError(postsError.message);
        setStatus("error");
      } else {
        setPosts(data || []);
        setStatus("ready");
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [activeCategory, posts]);

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="blog-page">
        <div className="blog-wrap">
          <header className="blog-hero">
            <span className="blog-eyebrow">Insights for growers, operators, and ag professionals</span>
            <h1>Harvest Drone Field Notes</h1>
            <p>Plain-spoken notes on input costs, SOURCE application, drone spraying windows, and the operating decisions that move real acres.</p>
          </header>

          <div className="blog-tabs" role="tablist" aria-label="Blog categories">
            {BLOG_CATEGORY_FILTERS.map((filter) => (
              <button
                className={`blog-tab ${activeCategory === filter.value ? "is-active" : ""}`}
                key={filter.value}
                onClick={() => setActiveCategory(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          {status === "loading" ? (
            <div className="blog-state"><strong>Loading field notes</strong>Pulling the latest published posts.</div>
          ) : null}

          {status === "error" ? (
            <div className="blog-state"><strong>Unable to load posts</strong>{error}</div>
          ) : null}

          {status === "ready" && filteredPosts.length === 0 ? (
            <div className="blog-state">
              <strong>No posts yet</strong>
              Published field notes will show up here after Jake reviews and publishes the first drafts.
            </div>
          ) : null}

          {status === "ready" && filteredPosts.length > 0 ? (
            <div className="blog-grid">
              {filteredPosts.map((post) => (
                <Link className="blog-card" key={post.slug} to={`/blog/${post.slug}`}>
                  <div className="blog-card__top">
                    <span className="blog-badge">{getBlogCategoryLabel(post.category)}</span>
                    <h2>{post.title}</h2>
                    {post.excerpt ? <p>{post.excerpt}</p> : null}
                  </div>
                  <div className="blog-card__meta">
                    <span>{formatDate(post.published_at)}</span>
                    <span>{post.reading_time_minutes || 4} min read</span>
                    <span>{post.author_name || "Jake Lund"}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}

export default BlogListPage;
