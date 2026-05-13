import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  BLOG_CATEGORY_FILTERS,
  BLOG_DEFAULT_CONTENT_LIBRARY,
  buildBlogEditorSeedFromCalendarItem,
  createBlogSlug,
  estimateReadingTimeMinutes,
  getBlogCategoryLabel,
  getNextPlannedBlogTopics,
  normalizeMetaDescription,
  normalizeBlogTags,
} from "../../shared/blog";

const css = `
.blog-admin{--bg:#0C0F0A;--surface:#151A12;--card:#1A2015;--elevated:#1F261A;--border:rgba(255,255,255,0.07);--border-active:rgba(163,217,119,0.28);--text:#E8E6E1;--muted:#8A927E;--dim:#5F6653;--accent:#A3D977;--accent-soft:rgba(163,217,119,0.08);--accent-med:rgba(163,217,119,0.16);--warning:#FBBF24;--danger:#F87171;--serif:'DM Serif Display',Georgia,serif;--sans:'Instrument Sans',Manrope,system-ui,sans-serif;--radius:10px;background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh;padding:24px 0 72px}
.blog-admin *{box-sizing:border-box}
.blog-admin-wrap{width:min(1280px,calc(100% - 32px));margin:0 auto;display:grid;gap:18px}
.blog-admin-header{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;justify-content:space-between}
.blog-admin-eyebrow{display:inline-flex;align-items:center;gap:8px;color:var(--accent);font-size:0.7rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase}
.blog-admin-eyebrow::before{content:'';width:18px;height:1px;background:var(--accent)}
.blog-admin h1,.blog-admin h2,.blog-admin h3{margin:0}
.blog-admin h1{font-family:var(--serif);font-size:clamp(2rem,5vw,3.5rem);font-weight:400;line-height:1;color:#fff}
.blog-admin-header p{margin:8px 0 0;color:var(--muted);max-width:680px}
.blog-admin-layout{display:grid;gap:18px}
@media(min-width:1020px){.blog-admin-layout{grid-template-columns:360px minmax(0,1fr);align-items:start}}
.blog-panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}
.blog-panel-pad{padding:18px}
.blog-admin-actions,.blog-admin-tabs,.blog-editor-actions,.blog-admin-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.blog-admin-btn{border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:var(--radius);padding:10px 13px;font-size:0.85rem;font-weight:800;cursor:pointer}
.blog-admin-btn--wide{padding:12px 16px}
.blog-admin-btn:hover,.blog-admin-btn.is-active{border-color:var(--border-active);background:var(--accent-soft)}
.blog-admin-btn--primary{border-color:transparent;background:var(--accent);color:var(--bg)}
.blog-admin-btn--danger{border-color:rgba(248,113,113,0.25);background:rgba(248,113,113,0.08);color:#ffdcdc}
.blog-admin-btn:disabled{opacity:.55;cursor:wait}
.blog-admin-tabs{margin:14px 0}
.blog-admin-tab{border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:999px;padding:8px 10px;font-weight:800;font-size:0.78rem;cursor:pointer}
.blog-admin-tab.is-active{color:var(--text);background:var(--accent-soft);border-color:var(--border-active)}
.blog-post-list,.blog-calendar-list{display:grid;gap:8px}
.blog-post-item,.blog-calendar-item{width:100%;text-align:left;border:1px solid var(--border);background:rgba(255,255,255,0.025);color:var(--text);border-radius:var(--radius);padding:13px;display:grid;gap:8px;cursor:pointer}
.blog-post-item:hover,.blog-post-item.is-active,.blog-calendar-item:hover{background:var(--card);border-color:var(--border-active)}
.blog-post-item strong,.blog-calendar-item strong{font-size:0.92rem;line-height:1.35}
.blog-post-item span,.blog-calendar-item span{color:var(--dim);font-size:0.76rem}
.blog-status{display:inline-flex;width:max-content;border:1px solid var(--border);background:rgba(255,255,255,0.04);border-radius:999px;padding:4px 8px;font-size:0.68rem;font-weight:800;text-transform:uppercase;color:var(--muted)}
.blog-status--published{color:#d7f6e1;border-color:rgba(90,197,136,.28);background:rgba(90,197,136,.12)}
.blog-status--review{color:#f2efcf;border-color:rgba(251,191,36,.28);background:rgba(251,191,36,.1)}
.blog-status--draft{color:#dcecff;border-color:rgba(96,165,250,.24);background:rgba(96,165,250,.1)}
.blog-editor{display:grid;gap:16px}
.blog-editor-grid{display:grid;gap:14px}
@media(min-width:780px){.blog-editor-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.blog-field--full{grid-column:1 / -1}}
.blog-field{display:grid;gap:7px}
.blog-field span{font-size:0.78rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
.blog-input,.blog-select,.blog-textarea{width:100%;border:1px solid var(--border);border-radius:var(--radius);background:#0A0D08;color:var(--text);padding:11px 12px;font-size:16px}
.blog-input:focus,.blog-select:focus,.blog-textarea:focus{outline:none;border-color:rgba(163,217,119,.45);box-shadow:0 0 0 3px var(--accent-soft)}
.blog-title-input{font-family:var(--serif);font-size:clamp(1.5rem,4vw,2.3rem);font-weight:400;line-height:1.1}
.blog-textarea{resize:vertical;min-height:110px}
.blog-textarea--body{min-height:420px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.92rem;line-height:1.65}
.blog-counter{font-size:0.75rem;color:var(--dim);text-align:right}
.blog-counter.is-over{color:var(--danger)}
.blog-editor-preview{padding:18px;border:1px solid var(--border);border-radius:var(--radius);background:rgba(255,255,255,0.025);display:grid;gap:10px}
.blog-editor-preview h2{font-family:var(--serif);font-size:1.35rem;font-weight:400;color:#fff}
.blog-preview-body{color:rgba(232,230,225,.84);line-height:1.7;font-size:.92rem}
.blog-preview-body h2{font-size:1.1rem;margin:16px 0 8px;border-bottom:1px solid var(--border);padding-bottom:6px}
.blog-preview-body h3{font-size:.95rem;color:var(--accent);margin:12px 0 6px}
.blog-preview-body p{margin:0 0 10px}
.blog-preview-body ul{margin:0 0 10px;padding-left:18px}
.blog-calendar{display:grid;gap:12px;margin-top:18px}
.blog-message{padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius);background:rgba(255,255,255,.03);color:var(--muted);font-size:.88rem}
.blog-message--active{border-color:var(--accent-med);background:var(--accent-soft);color:var(--text)}
.blog-message--error{border-color:rgba(248,113,113,.24);background:rgba(248,113,113,.08);color:#ffdcdc}
.blog-automation-card{display:grid;gap:12px;padding:16px;border:1px solid var(--accent-med);border-radius:var(--radius);background:var(--accent-soft);margin-bottom:18px}
.blog-automation-card strong{color:#fff}
.blog-automation-card p{margin:0;color:rgba(232,230,225,.82);line-height:1.55;font-size:.88rem}
`;

const emptyPost = {
  id: null,
  slug: "",
  title: "",
  subtitle: "",
  category: "insights",
  tags: [],
  meta_title: "",
  meta_description: "",
  excerpt: "",
  body: "",
  cta_type: "acre-plan",
  cta_text: "Get your free acre plan ->",
  cta_url: "/growers#grower-acre-plan-form",
  author_name: "Jake Lund",
  author_role: "Founder, Harvest Drone",
  status: "draft",
  reading_time_minutes: 1,
  word_count: 0,
};

const statusTabs = [
  ["all", "All"],
  ["draft", "Drafts"],
  ["review", "Review"],
  ["published", "Published"],
];

const demoAdminMessage =
  "Local demo mode can preview the blog topic library. To generate, save, and publish AI drafts, sign out and log in with a real Supabase admin account.";

function formatDate(value) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function countWords(body) {
  return String(body || "").trim().split(/\s+/).filter(Boolean).length;
}

function renderPreview(body) {
  return String(body || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((block, index) => {
      if (block.startsWith("## ")) return <h2 key={index}>{block.replace(/^##\s+/, "")}</h2>;
      if (block.startsWith("### ")) return <h3 key={index}>{block.replace(/^###\s+/, "")}</h3>;
      if (block.split("\n").every((line) => line.trim().startsWith("- "))) {
        return (
          <ul key={index}>
            {block.split("\n").map((line, itemIndex) => (
              <li key={itemIndex}>{line.trim().replace(/^-\s+/, "")}</li>
            ))}
          </ul>
        );
      }
      return <p key={index}>{block.replace(/\*\*/g, "")}</p>;
    });
}

function BlogAdminPage() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyPost);
  const [tagsInput, setTagsInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function runBlogAdminAction(action, payload = {}) {
    if (profile?.is_demo) {
      throw new Error(demoAdminMessage);
    }

    const { data, error: invokeError } = await supabase.functions.invoke("blog-admin", {
      body: { action, ...payload },
    });

    if (invokeError || data?.error) {
      throw new Error(invokeError?.message || data?.error || "Blog admin action failed.");
    }

    return data;
  }

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const data = await runBlogAdminAction("list");
      setPosts(data.posts || []);
      setCalendar(data.calendar?.length ? data.calendar : BLOG_DEFAULT_CONTENT_LIBRARY);

      if (!selectedId && data.posts?.[0]) {
        selectPost(data.posts[0]);
      }

      if (!data.calendar?.length) {
        setMessage("Using the built-in topic library until Supabase calendar rows are seeded.");
      }
    } catch (loadError) {
      setCalendar(BLOG_DEFAULT_CONTENT_LIBRARY);
      setError(`Using the built-in topic library locally because the admin API is unavailable: ${loadError.message}`);
    }

    setLoading(false);
  }

  useEffect(() => {
    document.title = "Blog Admin | Harvest Drone";
    loadData();

    return () => {
      document.title = "Harvest Drone";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPosts = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((post) => post.status === filter);
  }, [filter, posts]);

  const plannedCalendar = useMemo(() => {
    const existingSlugs = new Set(posts.map((post) => post.slug));
    const existingTitles = new Set(posts.map((post) => post.title));
    const availableTopics = calendar.filter((item) => {
      if (!item.isLocalLibrary) return true;
      return !existingTitles.has(item.title) && !existingSlugs.has(createBlogSlug(item.title));
    });
    return getNextPlannedBlogTopics(availableTopics, availableTopics.length || 20);
  }, [calendar, posts]);
  const nextLibraryTopic = plannedCalendar[0] || null;
  const metaDescriptionLength = form.meta_description?.length || 0;
  const bodyWordCount = countWords(form.body);

  function selectPost(post) {
    const next = { ...emptyPost, ...post };
    setSelectedId(post.id);
    setForm(next);
    setTagsInput((post.tags || []).join(", "));
    setMessage("");
    setError("");
  }

  function startNewPost(seed = {}) {
    const next = { ...emptyPost, ...seed };
    setSelectedId(null);
    setForm(next);
    setTagsInput((next.tags || []).join(", "));
    setMessage(seed.title ? "Library topic loaded. Click Generate This Draft With AI to write it." : "");
    setError("");
  }

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "title" && !current.meta_title) {
        next.meta_title = value;
      }

      if (field === "body") {
        next.word_count = countWords(value);
        next.reading_time_minutes = estimateReadingTimeMinutes(value);
      }

      return next;
    });
  }

  function buildPayload(sourceForm, publish = false, tagSource = tagsInput) {
    const publishedAt = publish
      ? sourceForm.published_at || new Date().toISOString()
      : sourceForm.status === "published"
        ? sourceForm.published_at || new Date().toISOString()
        : sourceForm.published_at || null;
    const status = publish ? "published" : sourceForm.status;

    return {
      slug: sourceForm.slug || createBlogSlug(sourceForm.title),
      title: sourceForm.title,
      subtitle: sourceForm.subtitle || null,
      category: sourceForm.category || "insights",
      tags: normalizeBlogTags(tagSource),
      meta_title: sourceForm.meta_title || sourceForm.title,
      meta_description: normalizeMetaDescription(sourceForm.meta_description),
      excerpt: sourceForm.excerpt || null,
      body: sourceForm.body || "",
      cta_type: sourceForm.cta_type || "acre-plan",
      cta_text: sourceForm.cta_text || null,
      cta_url: sourceForm.cta_url || null,
      author_name: sourceForm.author_name || "Jake Lund",
      author_role: sourceForm.author_role || "Founder, Harvest Drone",
      status,
      published_at: publishedAt,
      reading_time_minutes: sourceForm.reading_time_minutes || estimateReadingTimeMinutes(sourceForm.body),
      word_count: sourceForm.word_count || countWords(sourceForm.body),
      human_reviewed: publish ? true : sourceForm.human_reviewed || false,
      human_reviewed_by: publish ? profile?.full_name || profile?.email || "Harvest Drone admin" : sourceForm.human_reviewed_by || null,
      human_reviewed_at: publish ? new Date().toISOString() : sourceForm.human_reviewed_at || null,
      ai_generated: sourceForm.ai_generated || false,
      ai_prompt: sourceForm.ai_prompt || null,
      ai_model: sourceForm.ai_model || null,
      ai_generated_at: sourceForm.ai_generated_at || null,
    };
  }

  async function persistPost(sourceForm = form, { publish = false, tagSource = tagsInput } = {}) {
    if (!sourceForm.title.trim()) {
      throw new Error("Title is required.");
    }

    const payload = { ...buildPayload(sourceForm, publish, tagSource), id: sourceForm.id || null };
    const { post: saved } = await runBlogAdminAction("save", { post: payload, publish });
    setSelectedId(saved.id);
    setForm({ ...emptyPost, ...saved });
    setTagsInput((saved.tags || []).join(", "));
    await loadData();
    return saved;
  }

  async function handleSave(publish = false) {
    if (profile?.is_demo) {
      setMessage("");
      setError(demoAdminMessage);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await persistPost(form, { publish });
      setMessage(publish ? "Post published." : "Draft saved.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save post.");
    } finally {
      setSaving(false);
    }
  }

  async function generateArticle(seedForm = form, tagSource = tagsInput) {
    const keywords = normalizeBlogTags(tagSource);
    return runBlogAdminAction("generate", {
      post: {
        ...seedForm,
        tags: keywords,
        keywords,
        brief: seedForm.excerpt,
      },
    });
  }

  async function handleGenerateWithAi() {
    if (profile?.is_demo) {
      setMessage("");
      setError(demoAdminMessage);
      return;
    }

    let generationForm = form;
    let topicToMark = null;

    if (!generationForm.title.trim()) {
      if (!nextLibraryTopic) {
        setError("No planned library topics are waiting. Add a calendar topic or type a title to generate a one-off draft.");
        return;
      }

      generationForm = {
        ...emptyPost,
        ...buildBlogEditorSeedFromCalendarItem(nextLibraryTopic),
      };
      topicToMark = nextLibraryTopic;
      setForm(generationForm);
      setTagsInput((generationForm.tags || []).join(", "));
    }

    setGenerating(true);
    setGenerationStatus(`Generating "${generationForm.title}"...`);
    setError("");
    setMessage("");

    try {
      setGenerationStatus("Calling AI writer...");
      const { generated, post: saved } = await generateArticle(generationForm, generationForm.tags || tagsInput);
      setGenerationStatus("Saving draft for review...");
      const next = {
        ...emptyPost,
        ...generationForm,
        ...saved,
        tags: normalizeBlogTags(saved?.tags?.length ? saved.tags : generated.tags || generationForm.tags || tagsInput),
      };
      setForm(next);
      setTagsInput(next.tags.join(", "));
      setSelectedId(saved.id);
      await loadData();

      setMessage(topicToMark ? "Next library topic generated and saved for review." : "AI draft generated and saved for review.");
    } catch (generateError) {
      setError(`${generateError.message || "Unable to generate content."} The admin generator is deployed server-side so Jake should not need to add a title or touch Supabase.`);
    } finally {
      setGenerating(false);
      setGenerationStatus("");
    }
  }

  async function handleGeneratePlannedPosts() {
    if (profile?.is_demo) {
      setMessage("");
      setError(demoAdminMessage);
      return;
    }

    const items = getNextPlannedBlogTopics(calendar, 3);

    if (items.length === 0) {
      setMessage("No planned calendar posts are waiting.");
      return;
    }

    setGenerating(true);
    setGenerationStatus(`Generating ${items.length} blog drafts from the topic library...`);
    setError("");
    setMessage("");

    const results = [];
    const generatedPosts = [];

    for (const item of items) {
      setGenerationStatus(`Generating "${item.title}"...`);

      try {
        setGenerationStatus(`Calling AI writer for "${item.title}"...`);
        const { post } = await runBlogAdminAction("generate", { calendarItem: item });
        setGenerationStatus(`Saved "${post.title}" for review...`);
        results.push({ title: item.title, status: "generated" });
        generatedPosts.push(post);
      } catch (generationError) {
        results.push({ title: item.title, status: "failed", error: generationError.message });
      }
    }

    await loadData();
    if (generatedPosts[0]) {
      selectPost(generatedPosts[0]);
    }
    setGenerating(false);
    setGenerationStatus("");
    const generatedCount = results.filter((item) => item.status === "generated").length;
    const failedCount = results.length - generatedCount;
    const failedMessages = results.filter((item) => item.status === "failed").map((item) => `${item.title}: ${item.error}`);
    if (failedMessages.length) {
      setError(`${failedMessages.join(" ")} The server-side blog admin function could not finish those drafts.`);
    }
    setMessage(`${generatedCount} planned drafts generated${failedCount ? `, ${failedCount} failed. Check the error state.` : ""}.`);
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="blog-admin">
        <div className="blog-admin-wrap">
          <header className="blog-admin-header">
            <div>
              <span className="blog-admin-eyebrow">Organic traffic engine</span>
              <h1>Blog Admin</h1>
              <p>Click once to generate drafts from the built-in topic library. Jake reviews the agronomy, edits the copy, then publishes when it is accurate.</p>
            </div>
            <div className="blog-admin-actions">
              <button className="blog-admin-btn" onClick={() => startNewPost()} type="button">New Post</button>
              <button className="blog-admin-btn blog-admin-btn--primary blog-admin-btn--wide" disabled={generating} onClick={handleGeneratePlannedPosts} type="button">
                {generating ? "Generating drafts..." : "Generate 3 Drafts From Library"}
              </button>
            </div>
          </header>

          {generationStatus ? <div className="blog-message blog-message--active">{generationStatus}</div> : null}
          {message ? <div className="blog-message">{message}</div> : null}
          {error ? <div className="blog-message blog-message--error">{error}</div> : null}

          <div className="blog-admin-layout">
            <aside className="blog-panel blog-panel-pad">
              <div className="blog-automation-card">
                <strong>Recommended workflow</strong>
                <p>Generate review drafts from the topic library, open the first draft, adjust the facts, then click Publish.</p>
                <button className="blog-admin-btn blog-admin-btn--primary" disabled={generating} onClick={handleGeneratePlannedPosts} type="button">
                  {generating ? "Generating..." : `Generate next ${Math.min(3, plannedCalendar.length || 3)} drafts`}
                </button>
              </div>

              <h2>Posts</h2>
              <div className="blog-admin-tabs">
                {statusTabs.map(([value, label]) => (
                  <button className={`blog-admin-tab ${filter === value ? "is-active" : ""}`} key={value} onClick={() => setFilter(value)} type="button">
                    {label}
                  </button>
                ))}
              </div>

              <div className="blog-post-list">
                {loading ? <div className="blog-message">Loading posts...</div> : null}
                {!loading && filteredPosts.length === 0 ? <div className="blog-message">No posts in this view.</div> : null}
                {filteredPosts.map((post) => (
                  <button className={`blog-post-item ${selectedId === post.id ? "is-active" : ""}`} key={post.id} onClick={() => selectPost(post)} type="button">
                    <span className={`blog-status blog-status--${post.status}`}>{post.status}</span>
                    <strong>{post.title}</strong>
                    <span>{getBlogCategoryLabel(post.category)} | {formatDate(post.published_at || post.updated_at)}</span>
                  </button>
                ))}
              </div>

              <div className="blog-calendar">
                <h2>Content Calendar</h2>
                <div className="blog-calendar-list">
                  {plannedCalendar.slice(0, 8).map((item) => (
                    <button
                      className="blog-calendar-item"
                      key={item.id}
                      onClick={() => startNewPost(buildBlogEditorSeedFromCalendarItem(item))}
                      type="button"
                    >
                      <strong>{item.title}</strong>
                      <span>Priority {item.priority} | {getBlogCategoryLabel(item.category)}</span>
                    </button>
                  ))}
                  {!plannedCalendar.length ? <div className="blog-message">No planned posts left.</div> : null}
                </div>
              </div>
            </aside>

            <main className="blog-panel blog-panel-pad blog-editor">
              <div className="blog-editor-actions">
                <button className="blog-admin-btn" disabled={saving} onClick={() => handleSave(false)} type="button">
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button className="blog-admin-btn blog-admin-btn--primary" disabled={saving} onClick={() => handleSave(true)} type="button">
                  Publish
                </button>
                <button className="blog-admin-btn" disabled={generating} onClick={handleGenerateWithAi} type="button">
                  {generating ? "Generating..." : form.title.trim() ? "Generate This Draft With AI" : "Generate Next Library Draft"}
                </button>
              </div>

              <div className="blog-editor-grid">
                <label className="blog-field blog-field--full">
                  <span>Title</span>
                  <input className="blog-input blog-title-input" onChange={(event) => updateField("title", event.target.value)} value={form.title} />
                </label>
                <label className="blog-field blog-field--full">
                  <span>Subtitle</span>
                  <input className="blog-input" onChange={(event) => updateField("subtitle", event.target.value)} value={form.subtitle || ""} />
                </label>
                <label className="blog-field">
                  <span>Category</span>
                  <select className="blog-select" onChange={(event) => updateField("category", event.target.value)} value={form.category}>
                    {BLOG_CATEGORY_FILTERS.filter((item) => item.value !== "all").map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                    <option value="insights">Insights</option>
                  </select>
                </label>
                <label className="blog-field">
                  <span>Status</span>
                  <select className="blog-select" onChange={(event) => updateField("status", event.target.value)} value={form.status}>
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="blog-field blog-field--full">
                  <span>Tags</span>
                  <input className="blog-input" onChange={(event) => setTagsInput(event.target.value)} placeholder="nitrogen, source, drone" value={tagsInput} />
                </label>
                <label className="blog-field">
                  <span>Meta title</span>
                  <input className="blog-input" onChange={(event) => updateField("meta_title", event.target.value)} value={form.meta_title || ""} />
                </label>
                <label className="blog-field">
                  <span>Meta description</span>
                  <textarea className="blog-textarea" maxLength={155} onChange={(event) => updateField("meta_description", event.target.value)} value={form.meta_description || ""} />
                  <span className={`blog-counter ${metaDescriptionLength > 155 ? "is-over" : ""}`}>{metaDescriptionLength}/155</span>
                </label>
                <label className="blog-field blog-field--full">
                  <span>Excerpt</span>
                  <textarea className="blog-textarea" onChange={(event) => updateField("excerpt", event.target.value)} value={form.excerpt || ""} />
                </label>
                <label className="blog-field">
                  <span>CTA type</span>
                  <select className="blog-select" onChange={(event) => updateField("cta_type", event.target.value)} value={form.cta_type}>
                    <option value="acre-plan">Acre plan</option>
                    <option value="roi-calculator">ROI calculator</option>
                    <option value="enterprise-contact">Enterprise contact</option>
                    <option value="none">None</option>
                  </select>
                </label>
                <label className="blog-field">
                  <span>CTA text</span>
                  <input className="blog-input" onChange={(event) => updateField("cta_text", event.target.value)} value={form.cta_text || ""} />
                </label>
                <label className="blog-field">
                  <span>CTA URL</span>
                  <input className="blog-input" onChange={(event) => updateField("cta_url", event.target.value)} value={form.cta_url || ""} />
                </label>
                <label className="blog-field">
                  <span>Author name</span>
                  <input className="blog-input" onChange={(event) => updateField("author_name", event.target.value)} value={form.author_name || ""} />
                </label>
                <label className="blog-field">
                  <span>Author role</span>
                  <input className="blog-input" onChange={(event) => updateField("author_role", event.target.value)} value={form.author_role || ""} />
                </label>
                <label className="blog-field blog-field--full">
                  <span>Body markdown</span>
                  <textarea className="blog-textarea blog-textarea--body" onChange={(event) => updateField("body", event.target.value)} value={form.body || ""} />
                  <span className="blog-counter">{bodyWordCount} words | {form.reading_time_minutes || estimateReadingTimeMinutes(form.body)} min read</span>
                </label>
              </div>

              <section className="blog-editor-preview">
                <h2>Preview</h2>
                <div className="blog-preview-body">
                  {form.body ? renderPreview(form.body) : <p>Markdown preview appears here.</p>}
                </div>
              </section>
            </main>
          </div>
        </div>
      </section>
    </Shell>
  );
}

export default BlogAdminPage;
