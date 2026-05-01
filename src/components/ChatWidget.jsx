import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const CHAT_ENABLED_ROUTES = ["/growers", "/operators", "/hylio", "/source", "/source-acre-review", "/source-review"];
const SUGGESTIONS = [
  "What does SOURCE cost?",
  "How does drone spraying work?",
  "Do you service my area?",
];

const css = `
.chat-widget {
  --chat-bg: #111610;
  --chat-messages: #0C0F0A;
  --chat-input: #151A12;
  --chat-agent: #1A2015;
  --chat-user: rgba(163,217,119,0.12);
  --chat-border: rgba(255,255,255,0.06);
  --chat-text: #E8E6E1;
  --chat-muted: #727966;
  --chat-accent: #A3D977;
  --chat-sans: 'Instrument Sans', system-ui, sans-serif;
  --chat-serif: 'DM Serif Display', Georgia, serif;
}

.chat-btn {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--chat-accent);
  color: #0C0F0A;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  z-index: 9999;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.chat-btn:hover {
  transform: scale(1.08);
  filter: brightness(1.03);
}

.chat-btn--pulse {
  animation: chatIntroPulse 1.2s ease 1;
}

@keyframes chatIntroPulse {
  0% { transform: scale(1); box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
  40% { transform: scale(1.1); box-shadow: 0 0 0 12px rgba(163,217,119,0.18); }
  100% { transform: scale(1); box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
}

.chat-panel {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 380px;
  height: 520px;
  border: 1px solid var(--chat-border);
  border-radius: 16px;
  background: var(--chat-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 34px rgba(0,0,0,0.45);
  z-index: 9999;
  animation: chatSlideUp 0.25s ease;
  font-family: var(--chat-sans);
  color: var(--chat-text);
}

@keyframes chatSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  background: var(--chat-input);
  border-bottom: 1px solid var(--chat-border);
}

.chat-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}

.chat-header-title strong {
  font-family: var(--chat-serif);
  font-weight: 400;
  letter-spacing: 0.01em;
}

.chat-online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chat-accent);
}

.chat-header-close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--chat-border);
  background: rgba(255,255,255,0.02);
  color: var(--chat-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chat-header-close:hover {
  color: var(--chat-text);
  border-color: rgba(255,255,255,0.14);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 14px 8px;
  background: var(--chat-messages);
}

.chat-msg {
  max-width: 85%;
  padding: 10px 13px;
  border-radius: 12px;
  color: var(--chat-text);
  line-height: 1.5;
  font-size: 14px;
  white-space: pre-wrap;
}

.chat-msg strong {
  font-weight: 700;
}

.chat-msg--agent {
  align-self: flex-start;
  background: var(--chat-agent);
  border-radius: 12px 12px 12px 4px;
}

.chat-msg--user {
  align-self: flex-end;
  background: var(--chat-user);
  border-radius: 12px 12px 4px 12px;
}

.chat-hint {
  padding: 0 16px 10px;
  font-size: 12px;
  color: var(--chat-accent);
}

.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 14px 10px;
  background: var(--chat-messages);
}

.chat-pill {
  border-radius: 16px;
  border: 1px solid rgba(163,217,119,0.16);
  background: rgba(163,217,119,0.08);
  color: var(--chat-accent);
  font-size: 12px;
  font-weight: 500;
  padding: 6px 11px;
  cursor: pointer;
  font-family: var(--chat-sans);
}

.chat-pill:hover {
  background: rgba(163,217,119,0.15);
}

.chat-loading {
  display: flex;
  gap: 4px;
  align-self: flex-start;
  padding: 10px 14px;
}

.chat-loading span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--chat-muted);
  animation: chatPulse 1s infinite;
}

.chat-loading span:nth-child(2) { animation-delay: 0.15s; }
.chat-loading span:nth-child(3) { animation-delay: 0.3s; }

@keyframes chatPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.chat-input-bar {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid var(--chat-border);
  background: var(--chat-input);
}

.chat-input {
  flex: 1;
  border-radius: 8px;
  border: 1px solid var(--chat-border);
  background: var(--chat-messages);
  color: var(--chat-text);
  font-size: 14px;
  font-family: var(--chat-sans);
  padding: 10px 12px;
  outline: none;
}

.chat-input:focus {
  border-color: rgba(163,217,119,0.3);
}

.chat-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: var(--chat-accent);
  color: #0C0F0A;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-send-btn:hover {
  filter: brightness(1.05);
}

.chat-send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .chat-btn {
    right: 16px;
    bottom: 16px;
  }

  .chat-panel {
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 70vh;
    border-radius: 16px 16px 0 0;
  }
}
`;

function normalizePathname(pathname = "/") {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function isPublicPath(pathname) {
  const normalizedPath = normalizePathname(pathname);
  return CHAT_ENABLED_ROUTES.some((route) => normalizedPath === route || normalizedPath.startsWith(`${route}/`));
}

function formatAgentContent(content = "") {
  return content.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function createFunctionHeaders() {
  const headers = {
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };

  if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(import.meta.env.VITE_SUPABASE_ANON_KEY || "")) {
    headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
  }

  return headers;
}

function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesRef = useRef(null);

  const shouldShow = useMemo(() => isPublicPath(location.pathname), [location.pathname]);
  const hasUserMessage = useMemo(() => messages.some((message) => message.role === "user"), [messages]);

  useEffect(() => {
    if (!showPulse) return undefined;
    const timer = setTimeout(() => setShowPulse(false), 1400);
    return () => clearTimeout(timer);
  }, [showPulse]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen || hasStarted) return;
    setMessages([
      {
        role: "agent",
        content: "Hey! I can answer questions about SOURCE, drone application, and pricing. What are you working with?",
      },
    ]);
    setHasStarted(true);
  }, [hasStarted, isOpen]);

  if (!shouldShow) return null;

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text || isLoading) return;

    const userMessage = { role: "user", content: text };
    const historyForRequest = messages.slice(-20).map((message) => ({
      role: message.role === "agent" ? "assistant" : "user",
      content: message.content,
    }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: createFunctionHeaders(),
        body: JSON.stringify({
          message: text,
          history: historyForRequest,
          page: location.pathname,
        }),
      });

      const data = await response.json();
      const agentMessage = {
        role: "agent",
        content: data.response || "Sorry, I missed that. You can reach Jake Lund at 612-258-0582.",
      };

      setMessages((current) => [...current, agentMessage]);

      if (data.lead_captured) {
        setMessages((current) => [
          ...current,
          {
            role: "agent",
            content: "Great, Jake will follow up within a day.",
          },
        ]);
      }
    } catch (_error) {
      setMessages((current) => [
        ...current,
        {
          role: "agent",
          content: "Sorry, I'm having trouble connecting. You can reach Jake Lund directly at 612-258-0582.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="chat-widget">
      <style>{css}</style>

      {!isOpen ? (
        <button
          type="button"
          className={`chat-btn${showPulse ? " chat-btn--pulse" : ""}`}
          aria-label="Open chat"
          onClick={() => setIsOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" aria-hidden="true">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
        </button>
      ) : (
        <section className="chat-panel" aria-live="polite">
          <header className="chat-header">
            <div className="chat-header-title">
              <strong>Harvest Drone</strong>
              <span className="chat-online-dot" />
            </div>
            <button type="button" className="chat-header-close" aria-label="Close chat" onClick={() => setIsOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="16" height="16" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className="chat-messages" ref={messagesRef}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-msg ${message.role === "user" ? "chat-msg--user" : "chat-msg--agent"}`}>
                {formatAgentContent(message.content)}
              </div>
            ))}

            {isLoading ? (
              <div className="chat-loading" aria-label="Thinking">
                <span />
                <span />
                <span />
              </div>
            ) : null}
          </div>

          {!hasUserMessage ? (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} type="button" className="chat-pill" onClick={() => sendMessage(suggestion)} disabled={isLoading}>
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <div className="chat-input-bar">
            <input
              className="chat-input"
              value={input}
              placeholder="Ask about SOURCE, pricing, or application..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage(input);
                }
              }}
            />
            <button type="button" className="chat-send-btn" aria-label="Send message" onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="18" height="18" aria-hidden="true">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22l-4-9-9-4z" />
              </svg>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default ChatWidget;
