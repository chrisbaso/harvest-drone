import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import { supabase } from "../lib/supabase";
import { BLOG_BASE_URL, getBlogCategoryLabel, getBlogCtaConfig } from "../../shared/blog";

const css = `
.blog-post-page{--bg:#0C0F0A;--surface:#151A12;--card:#1A2015;--border:rgba(255,255,255,0.07);--border-active:rgba(163,217,119,0.28);--text:#E8E6E1;--muted:#8A927E;--dim:#5F6653;--accent:#A3D977;--accent-soft:rgba(163,217,119,0.08);--accent-med:rgba(163,217,119,0.16);--serif:'DM Serif Display',Georgia,serif;--sans:'Instrument Sans',Manrope,system-ui,sans-serif;--radius:10px;background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh;padding:0 0 72px}
.blog-post-page *{box-sizing:border-box}
.blog-post-wrap{width:min(1040px,calc(100% - 32px));margin:0 auto}
.blog-post-header{max-width:820px;margin:0 auto;padding:72px 0 34px;text-align:left}
.blog-post-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--accent-med);background:var(--accent-soft);color:var(--accent);border-radius:999px;padding:5px 10px;font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase}
.blog-post-header h1{font-family:var(--serif);font-size:clamp(2.45rem,7vw,5.25rem);font-weight:400;line-height:0.98;margin:18px 0 0;color:#fff;letter-spacing:0}
.blog-post-subtitle{max-width:680px;color:rgba(232,230,225,0.78);font-size:1.1rem;line-height:1.7;margin:18px 0 0}
.blog-post-meta{display:flex;flex-wrap:wrap;gap:8px 14px;color:var(--dim);font-size:0.86rem;margin-top:18px}
.blog-post-shell{display:grid;gap:34px}
.blog-body{max-width:680px;margin:0 auto;width:100%}
.blog-body h1{font-family:var(--serif);font-size:1.5rem;margin-top:2rem;font-weight:400;color:var(--text)}
.blog-body h2{font-family:var(--serif);font-size:1.25rem;margin-top:1.5rem;padding-bottom:0.5rem;border-bottom:1px solid var(--border);font-weight:400;color:var(--text)}
.blog-body h3{font-size:1rem;font-weight:700;color:var(--accent);margin-top:1rem}
.blog-body p{font-size:1rem;line-height:1.8;color:rgba(232,230,225,0.88);margin:0 0 1rem}
.blog-body ul,.blog-body ol{padding-left:1.5rem;margin:0 0 1rem;color:rgba(232,230,225,0.88)}
.blog-body li{line-height:1.7;margin-bottom:0.35rem}
.blog-body li::marker{color:var(--accent)}
.blog-body blockquote{margin:1.5rem 0;padding:1rem 1.25rem;border-left:3px solid var(--accent);background:var(--accent-soft);border-radius:0 8px 8px 0;color:var(--text)}
.blog-body strong{color:var(--text)}
.blog-body a{color:var(--accent);text-decoration:underline;text-underline-offset:2px}
.blog-body code{font-size:0.92em;color:#f2efcf;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:5px;padding:0.08rem 0.32rem}
.blog-body img{width:100%;border-radius:8px;margin:1.5rem 0;border:1px solid var(--border)}
.blog-body hr{border:none;height:1px;background:var(--border);margin:2rem 0}
.blog-cta{max-width:680px;margin:2rem auto;padding:24px;background:linear-gradient(135deg,var(--card) 0%,var(--surface) 100%);border:1px solid var(--border);border-radius:var(--radius);display:grid;gap:14px}
.blog-cta h2,.blog-related h2{font-family:var(--serif);font-size:1.55rem;font-weight:400;line-height:1.15;margin:0;color:#fff}
.blog-cta p{margin:0;color:var(--muted);line-height:1.65}
.blog-cta a,.blog-share button{width:max-content;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:var(--radius);padding:12px 18px;font-weight:800;color:var(--bg);background:var(--accent);cursor:pointer;text-decoration:none}
.blog-bottom-cta{max-width:880px;text-align:center;margin-top:18px}
.blog-bottom-cta a{justify-self:center}
.blog-share{max-width:680px;margin:0 auto;display:flex;flex-wrap:wrap;gap:10px}
.blog-share a,.blog-share button{font-size:0.85rem}
.blog-share a{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:var(--radius);padding:11px 16px;background:var(--surface);color:var(--text);font-weight:800;text-decoration:none}
.blog-related{max-width:880px;margin:22px auto 0;display:grid;gap:14px}
.blog-related-grid{display:grid;gap:12px}
@media(min-width:720px){.blog-related-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.blog-related-card{display:grid;gap:10px;padding:18px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);transition:background .15s,border-color .15s,transform .15s}
.blog-related-card:hover{background:var(--card);border-color:var(--border-active);transform:translateY(-1px)}
.blog-related-card strong{font-family:var(--serif);font-size:1.18rem;font-weight:400;line-height:1.18;color:#fff}
.blog-related-card span{color:var(--dim);font-size:0.8rem}
.blog-post-state{max-width:680px;margin:72px auto 0;padding:28px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--muted)}
.blog-post-state strong{display:block;color:#fff;font-family:var(--serif);font-size:1.5rem;font-weight:400;margin-bottom:6px}
`;

function formatDate(value) {
  if (!value) return "Unpublished";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

function safeHref(url) {
  const value = String(url || "");
  return value.trim().toLowerCase().startsWith("javascript:") ? "#" : value;
}

function renderInline(text) {
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  return String(text)
    .split(tokenRegex)
    .filter((part) => part !== "")
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const href = safeHref(linkMatch[2]);
        const isExternal = /^https?:\/\//i.test(href);
        return (
          <a href={href} key={`${part}-${index}`} rel={isExternal ? "noreferrer" : undefined} target={isExternal ? "_blank" : undefined}>
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
}

function CtaBox({ bottom = false, post }) {
  const cta = getBlogCtaConfig(post);

  if (!cta) {
    return null;
  }

  return (
    <aside className={`blog-cta ${bottom ? "blog-bottom-cta" : ""}`}>
      <h2>{bottom ? "Ready to see what this looks like on your acres?" : "Want the per-acre plan for your farm?"}</h2>
      <p>
        Harvest Drone can map the acres, products, timing, and expected economics before you commit to a pass.
      </p>
      <a href={cta.url}>{cta.text}</a>
    </aside>
  );
}

function renderMarkdown(content, post) {
  const blocks = String(content || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const insertAfter = Math.max(1, Math.floor(blocks.length * 0.4));
  const rendered = [];

  blocks.forEach((block, index) => {
    const key = `block-${index}`;

    if (/^---+$/.test(block)) {
      rendered.push(<hr key={key} />);
    } else if (block.startsWith("# ")) {
      rendered.push(<h1 key={key}>{renderInline(block.replace(/^#\s+/, ""))}</h1>);
    } else if (block.startsWith("## ")) {
      rendered.push(<h2 key={key}>{renderInline(block.replace(/^##\s+/, ""))}</h2>);
    } else if (block.startsWith("### ")) {
      rendered.push(<h3 key={key}>{renderInline(block.replace(/^###\s+/, ""))}</h3>);
    } else if (/^!\[[^\]]*\]\([^)]+\)$/.test(block)) {
      const match = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      rendered.push(<img alt={match[1]} key={key} src={safeHref(match[2])} />);
    } else if (block.split("\n").every((line) => line.trim().startsWith(">"))) {
      rendered.push(<blockquote key={key}>{renderInline(block.replace(/^>\s?/gm, ""))}</blockquote>);
    } else if (block.split("\n").every((line) => /^[-*]\s+/.test(line.trim()))) {
      rendered.push(
        <ul key={key}>
          {block.split("\n").map((line, itemIndex) => (
            <li key={itemIndex}>{renderInline(line.trim().replace(/^[-*]\s+/, ""))}</li>
          ))}
        </ul>,
      );
    } else if (block.split("\n").every((line) => /^\d+\.\s+/.test(line.trim()))) {
      rendered.push(
        <ol key={key}>
          {block.split("\n").map((line, itemIndex) => (
            <li key={itemIndex}>{renderInline(line.trim().replace(/^\d+\.\s+/, ""))}</li>
          ))}
        </ol>,
      );
    } else {
      rendered.push(<p key={key}>{renderInline(block)}</p>);
    }

    if (index + 1 === insertAfter) {
      rendered.push(<CtaBox key="inline-cta" post={post} />);
    }
  });

  if (blocks.length === 0) {
    rendered.push(<CtaBox key="inline-cta-empty" post={post} />);
  }

  return rendered;
}

function setMetaProperty(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.content = content || "";
}

function setMetaDescription(content) {
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = content || "";
}

function setCanonical(href) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = href;
}

function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      setStatus("loading");
      setError("");

      const { data, error: postError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (!isMounted) return;

      if (postError) {
        setError(postError.message);
        setStatus("error");
        return;
      }

      if (!data) {
        setStatus("not-found");
        return;
      }

      setPost(data);
      setStatus("ready");

      const { data: related } = await supabase
        .from("blog_posts")
        .select("slug, title, category, published_at, reading_time_minutes")
        .eq("status", "published")
        .eq("category", data.category)
        .neq("slug", data.slug)
        .order("published_at", { ascending: false })
        .limit(3);

      if (isMounted) {
        setRelatedPosts(related || []);
      }
    }

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!post) return undefined;

    const title = post.meta_title || post.title;
    const description = post.meta_description || post.excerpt || "";
    const canonicalUrl = post.canonical_url || `${BLOG_BASE_URL}/blog/${post.slug}`;
    document.title = title;
    setMetaDescription(description);
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:type", "article");
    setMetaProperty("og:url", canonicalUrl);

    if (post.featured_image_url) {
      setMetaProperty("og:image", post.featured_image_url);
    }

    setCanonical(canonicalUrl);

    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description,
      author: { "@type": "Person", name: post.author_name || "Jake Lund" },
      datePublished: post.published_at,
      dateModified: post.updated_at,
      publisher: {
        "@type": "Organization",
        name: "Harvest Drone",
        url: BLOG_BASE_URL,
      },
    };
    let scriptTag = document.querySelector("#blog-schema");
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "blog-schema";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schema);

    supabase.rpc("increment_blog_view", { post_slug: post.slug }).catch(() => {});

    return () => {
      document.title = "Harvest Drone";
    };
  }, [post]);

  const shareUrl = useMemo(() => (post ? `${BLOG_BASE_URL}/blog/${post.slug}` : ""), [post]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="blog-post-page">
        <div className="blog-post-wrap">
          {status === "loading" ? (
            <div className="blog-post-state"><strong>Loading field note</strong>Pulling the article from Harvest Drone.</div>
          ) : null}

          {status === "error" ? (
            <div className="blog-post-state"><strong>Unable to load article</strong>{error}</div>
          ) : null}

          {status === "not-found" ? (
            <div className="blog-post-state">
              <strong>Article not found</strong>
              This post may still be in review or it may have moved.
              <p><Link to="/blog">Back to Field Notes</Link></p>
            </div>
          ) : null}

          {status === "ready" && post ? (
            <article className="blog-post-shell">
              <header className="blog-post-header">
                <span className="blog-post-badge">{getBlogCategoryLabel(post.category)}</span>
                <h1>{post.title}</h1>
                {post.subtitle ? <p className="blog-post-subtitle">{post.subtitle}</p> : null}
                <div className="blog-post-meta">
                  <span>{post.author_name || "Jake Lund"}</span>
                  <span>{formatDate(post.published_at)}</span>
                  <span>{post.reading_time_minutes || 4} min read</span>
                </div>
              </header>

              <div className="blog-body">{renderMarkdown(post.body, post)}</div>

              <div className="blog-share">
                <button onClick={copyLink} type="button">{copied ? "Copied" : "Copy link"}</button>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Share on X
                </a>
              </div>

              <CtaBox bottom post={post} />

              {relatedPosts.length ? (
                <section className="blog-related">
                  <h2>Related field notes</h2>
                  <div className="blog-related-grid">
                    {relatedPosts.map((related) => (
                      <Link className="blog-related-card" key={related.slug} to={`/blog/${related.slug}`}>
                        <strong>{related.title}</strong>
                        <span>{formatDate(related.published_at)} | {related.reading_time_minutes || 4} min</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </article>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}

export default BlogPostPage;
