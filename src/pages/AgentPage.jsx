import { useEffect, useMemo, useRef, useState } from "react";
import Shell from "../components/Shell";

const SUGGESTED_QUESTIONS = [
  "How many leads this week?",
  "How's the Farm Day campaign?",
  "Who should I call today?",
  "Show me unpaid orders",
  "What's our pipeline value?",
];

const css = `
.agent-page {
  --bg: #0C0F0A;
  --surface: #151A12;
  --card: #1A2015;
  --border: rgba(255,255,255,0.06);
  --text: #E8E6E1;
  --text-muted: #727966;
  --accent: #A3D977;
  --accent-strong: #b7eb87;
  --user-bubble: rgba(163,217,119,0.12);
  --user-border: rgba(163,217,119,0.18);
  --shadow: 0 18px 40px rgba(0,0,0,0.24);
  --sans: "Instrument Sans", "Inter", system-ui, sans-serif;
  --serif: "DM Serif Display", Georgia, serif;

  min-height: calc(100vh - 4rem);
  background:
    radial-gradient(circle at top, rgba(163,217,119,0.08), transparent 28%),
    linear-gradient(180deg, rgba(255,255,255,0.015), transparent 22%),
    var(--bg);
  color: var(--text);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
}

.agent-page__shell {
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  padding: 32px 24px 152px;
}

.agent-page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 22px;
}

.agent-page__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 14px;
}

.agent-page__eyebrow::before {
  content: "";
  width: 30px;
  height: 1px;
  background: currentColor;
}

.agent-page__title {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  line-height: 1.08;
  color: #fff;
}

.agent-page__subtitle {
  margin: 14px 0 0;
  max-width: 760px;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.7;
}

.agent-page__status {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.03);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
}

.agent-page__status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 6px rgba(163,217,119,0.12);
}

.agent-page__frame {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(255,255,255,0.015), transparent 18%), var(--surface);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.agent-page__history {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.agent-page__empty {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 4px 8px;
}

.agent-page__empty-card {
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.025);
  border-radius: 18px;
  padding: 22px;
}

.agent-page__empty-card h2 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #fff;
}

.agent-page__empty-card p {
  margin: 0;
  max-width: 720px;
  color: var(--text-muted);
  line-height: 1.7;
}

.agent-page__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.agent-page__suggestion {
  border: 1px solid rgba(163,217,119,0.16);
  background: rgba(163,217,119,0.08);
  color: var(--accent-strong);
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease;
}

.agent-page__suggestion:hover:enabled {
  transform: translateY(-1px);
  background: rgba(163,217,119,0.12);
  border-color: rgba(163,217,119,0.3);
}

.agent-page__message-row {
  display: flex;
}

.agent-page__message-row--user {
  justify-content: flex-end;
}

.agent-page__message {
  width: min(780px, 100%);
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--card);
  padding: 18px 18px 14px;
}

.agent-page__message-row--user .agent-page__message {
  background: var(--user-bubble);
  border-color: var(--user-border);
}

.agent-page__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.agent-page__meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
}

.agent-page__body {
  color: var(--text);
  font-size: 14px;
  line-height: 1.75;
}

.agent-page__body p {
  margin: 0 0 12px;
}

.agent-page__body p:last-child {
  margin-bottom: 0;
}

.agent-page__body strong {
  color: #fff;
  font-weight: 700;
}

.agent-page__metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin: 14px 0;
}

.agent-page__metric {
  border: 1px solid rgba(163,217,119,0.12);
  background: rgba(163,217,119,0.07);
  border-radius: 14px;
  padding: 14px;
}

.agent-page__metric-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.agent-page__metric-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}

.agent-page__table {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0;
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
}

.agent-page__table-wrap {
  overflow-x: auto;
}

.agent-page__table th,
.agent-page__table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.agent-page__table th {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(255,255,255,0.03);
}

.agent-page__table tr:last-child td {
  border-bottom: none;
}

.agent-page__input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  border-top: 1px solid var(--border);
  background: rgba(12,15,10,0.95);
  backdrop-filter: blur(10px);
}

.agent-page__input-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 24px 24px;
}

.agent-page__composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: end;
}

.agent-page__input {
  min-height: 58px;
  max-height: 180px;
  resize: vertical;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  line-height: 1.6;
  padding: 16px 18px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.agent-page__input:focus {
  border-color: rgba(163,217,119,0.32);
  box-shadow: 0 0 0 3px rgba(163,217,119,0.08);
}

.agent-page__input::placeholder {
  color: var(--text-muted);
}

.agent-page__send {
  min-width: 120px;
  height: 58px;
  border: none;
  border-radius: 16px;
  background: var(--accent);
  color: var(--bg);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, opacity 0.12s ease, background 0.12s ease;
}

.agent-page__send:hover:enabled {
  transform: translateY(-1px);
  background: var(--accent-strong);
}

.agent-page__send:disabled,
.agent-page__suggestion:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.agent-page__hint {
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 12px;
}

.agent-page__loading {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.agent-page__loading span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.4;
  animation: agent-page-pulse 1s infinite ease-in-out;
}

.agent-page__loading span:nth-child(2) { animation-delay: 0.15s; }
.agent-page__loading span:nth-child(3) { animation-delay: 0.3s; }

@keyframes agent-page-pulse {
  0%, 80%, 100% { transform: scale(0.9); opacity: 0.32; }
  40% { transform: scale(1.15); opacity: 1; }
}

@media (max-width: 900px) {
  .agent-page__shell {
    padding: 24px 16px 148px;
  }

  .agent-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .agent-page__history {
    padding: 18px;
  }
}

@media (max-width: 640px) {
  .agent-page__composer {
    grid-template-columns: 1fr;
  }

  .agent-page__send {
    width: 100%;
  }

  .agent-page__input-inner {
    padding: 14px 16px 18px;
  }
}
`;

function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

function applyInlineFormatting(text) {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function looksLikeTable(lines) {
  return lines.length >= 2 && lines.every((line) => line.trim().startsWith("|") && line.trim().endsWith("|"));
}

function parseTable(lines) {
  const cells = lines.map((line) =>
    line
      .trim()
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim()),
  );

  const [header, ...rest] = cells;
  const body = rest.filter((row) => !row.every((cell) => /^-+$/.test(cell.replace(/:/g, ""))));

  return { header, body };
}

function looksLikeMetric(line) {
  return /^[A-Za-z][A-Za-z0-9\s/%$()'’-]{1,40}:\s+.+$/.test(line) && !line.trim().startsWith("|");
}

function parseBlocks(content) {
  const normalized = String(content || "").replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const chunks = normalized.split(/\n\s*\n/);

  return chunks.map((chunk) => {
    const lines = chunk
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean);

    if (looksLikeTable(lines)) {
      return { type: "table", ...parseTable(lines) };
    }

    if (lines.length > 1 && lines.every(looksLikeMetric)) {
      return {
        type: "metrics",
        items: lines.map((line) => {
          const [label, ...valueParts] = line.split(":");
          return {
            label: label.trim(),
            value: valueParts.join(":").trim(),
          };
        }),
      };
    }

    return {
      type: "text",
      paragraphs: chunk.split("\n").filter(Boolean),
    };
  });
}

function AgentResponse({ content }) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <div className="agent-page__body">
      {blocks.map((block, index) => {
        if (block.type === "metrics") {
          return (
            <div key={`metric-${index}`} className="agent-page__metric-grid">
              {block.items.map((item) => (
                <div key={`${item.label}-${item.value}`} className="agent-page__metric">
                  <span className="agent-page__metric-label">{item.label}</span>
                  <span className="agent-page__metric-value">{item.value}</span>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === "table") {
          return (
            <div key={`table-${index}`} className="agent-page__table-wrap">
              <table className="agent-page__table">
                <thead>
                  <tr>
                    {block.header.map((cell, headerIndex) => (
                      <th key={`${cell}-${headerIndex}`}>{cell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.body.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${cell}-${cellIndex}`}
                          dangerouslySetInnerHTML={{ __html: applyInlineFormatting(cell) }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return block.paragraphs.map((paragraph, paragraphIndex) => (
          <p
            key={`text-${index}-${paragraphIndex}`}
            dangerouslySetInnerHTML={{ __html: applyInlineFormatting(paragraph) }}
          />
        ));
      })}
    </div>
  );
}

function AgentPage() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content: "Hey Jake. I can look up leads, check email campaigns, and pull pipeline data. What do you need?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const historyRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    historyRef.current?.scrollTo({
      top: historyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  async function sendMessage(overrideMessage) {
    const messageText = (overrideMessage ?? input).trim();
    if (!messageText || isLoading) {
      return;
    }

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setMessages((current) => [
        ...current,
        {
          role: "agent",
          content: "Supabase is not configured in this environment. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using the agent.",
          timestamp: new Date(),
        },
      ]);
      setInput("");
      return;
    }

    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    const history = messagesRef.current.slice(-10).map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history,
        }),
      });

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "agent",
          content: data.response || "Something went wrong. Try again.",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "agent",
          content: "Connection error. Check if the agent function is deployed.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="agent-page">
        <div className="agent-page__shell">
          <header className="agent-page__header">
            <div>
              <span className="agent-page__eyebrow">Internal operations assistant</span>
              <h1 className="agent-page__title">Harvest Drone Agent</h1>
              <p className="agent-page__subtitle">
                Ask about leads, SOURCE orders, pipeline movement, or live email performance. This first phase is read-only and pulls from Supabase and Mailchimp in real time.
              </p>
            </div>
            <div className="agent-page__status">
              <span className="agent-page__status-dot" />
              Connected
            </div>
          </header>

          <div className="agent-page__frame">
            <div ref={historyRef} className="agent-page__history">
              {messages.length === 1 ? (
                <div className="agent-page__empty">
                  <div className="agent-page__empty-card">
                    <h2>Start with one of these quick checks</h2>
                    <p>
                      The agent can answer direct questions about lead counts, unpaid orders, campaign performance, and who deserves a follow-up first.
                    </p>
                  </div>
                  <div className="agent-page__suggestions">
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        className="agent-page__suggestion"
                        onClick={() => sendMessage(question)}
                        disabled={isLoading}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${message.timestamp.toISOString()}-${index}`}
                  className={`agent-page__message-row${message.role === "user" ? " agent-page__message-row--user" : ""}`}
                >
                  <article className="agent-page__message">
                    <div className="agent-page__meta">
                      <span>{message.role === "user" ? "Jake" : "Agent"}</span>
                      <span className="agent-page__meta-dot" />
                      <span>{formatTimestamp(message.timestamp)}</span>
                    </div>
                    {message.role === "agent" ? (
                      <AgentResponse content={message.content} />
                    ) : (
                      <div
                        className="agent-page__body"
                        dangerouslySetInnerHTML={{ __html: applyInlineFormatting(message.content).replace(/\n/g, "<br />") }}
                      />
                    )}
                  </article>
                </div>
              ))}

              {isLoading ? (
                <div className="agent-page__message-row">
                  <article className="agent-page__message">
                    <div className="agent-page__meta">
                      <span>Agent</span>
                      <span className="agent-page__meta-dot" />
                      <span>Working</span>
                    </div>
                    <div className="agent-page__loading" aria-label="Agent is thinking">
                      <span />
                      <span />
                      <span />
                    </div>
                  </article>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="agent-page__input-bar">
          <div className="agent-page__input-inner">
            <form className="agent-page__composer" onSubmit={handleSubmit}>
              <textarea
                className="agent-page__input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about leads, orders, campaigns, or priorities..."
                rows={2}
                disabled={isLoading}
              />
              <button className="agent-page__send" type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? "Working..." : "Send"}
              </button>
            </form>
            <p className="agent-page__hint">Enter sends. Shift+Enter adds a new line.</p>
          </div>
        </div>
      </section>
    </Shell>
  );
}

export default AgentPage;
