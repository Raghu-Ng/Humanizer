import { useState, useRef } from "react";

const SYSTEM_PROMPT = `You are a writing editor that identifies and removes signs of AI-generated text to make writing sound more natural and human. You are an expert at detecting and fixing: inflated significance language, promotional language, superficial -ing analyses, vague attributions, em dash overuse, rule-of-three patterns, AI vocabulary words, negative parallelisms, excessive conjunctive phrases, and soulless neutral voice.

Your job is to humanize text in three stages. Respond ONLY with valid JSON — no markdown fences, no preamble.

Return this exact structure:
{
  "draft": "Your first-pass humanized rewrite here",
  "tells": ["tell 1", "tell 2", "tell 3"],
  "final": "Your final humanized version after the audit",
  "changes": ["change made 1", "change made 2", "change made 3", "change made 4", "change made 5"]
}

Rules for humanizing:
- Remove significance inflation (pivotal, testament, underscores, reflects broader, shaping the, marks a shift)
- Remove promotional language (vibrant, breathtaking, nestled, groundbreaking, renowned, boasts)
- Remove vague attributions (experts argue, observers note, industry reports)
- Remove superficial -ing phrases tacked on for fake depth
- Remove rule-of-three and synonym cycling
- Remove em dashes used for fake drama
- Replace copula avoidance (serves as, functions as, stands as) with is/are
- Remove generic positive conclusions (future looks bright, exciting times)
- Remove chatbot artifacts (Great question!, I hope this helps!)
- Add genuine personality and voice — opinions, varied rhythm, specificity, first-person where natural
- Be specific about feelings rather than vague ("kind of unsettling" beats "concerning")
- Vary sentence length — short punchy ones, longer ones that take their time
- The final version should feel like a real person wrote it, with a real point of view`;

const PLACEHOLDER = `AI-assisted coding serves as an enduring testament to the transformative potential of large language models, marking a pivotal moment in the evolution of software development. In today's rapidly evolving technological landscape, these groundbreaking tools are reshaping how engineers ideate, iterate, and deliver, underscoring their vital role in modern workflows.

At its core, the value proposition is clear: streamlining processes, enhancing collaboration, and fostering alignment. It's not just about autocomplete; it's about unlocking creativity at scale, ensuring that organizations can remain agile while delivering seamless, intuitive, and powerful experiences.

Industry observers have noted that adoption has accelerated significantly. The technology has been featured in major publications, highlighting its growing importance. Additionally, the ability to generate documentation and tests showcases how AI can contribute to better outcomes.

In conclusion, the future looks bright. Exciting times lie ahead as we continue this journey toward excellence.`;

const Spinner = () => (
  <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

export default function Humanizer() {
  const [apiKey, setApiKey] = useState("");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("final");
  const textareaRef = useRef(null);

  const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

  const humanize = async () => {
    const text = input.trim();
    if (!text) return;
    setStage("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(apiKey ? { "x-api-key": apiKey } : {}) },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Humanize this text:\n\n${text}` }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.map(b => b.text || "").join("") || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setResult(parsed);
      setStage("done");
      setActiveTab("final");
    } catch (err) {
      setErrorMsg("Something went wrong. Try again.");
      setStage("error");
    }
  };

  const reset = () => {
    setInput("");
    setStage("idle");
    setResult(null);
    setErrorMsg("");
  };

  const loadExample = () => {
    setInput(PLACEHOLDER);
    setStage("idle");
    setResult(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:ital,wght@0,300;0,400;1,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body, #root { 
          min-height: 100vh; 
          background: #0d0c0a;
        }

        .app {
          min-height: 100vh;
          background: #0d0c0a;
          color: #e8e0d0;
          font-family: 'Source Serif 4', Georgia, serif;
          padding: 0 0 80px 0;
        }

        .masthead {
          border-bottom: 3px double #3a3530;
          padding: 32px 40px 20px;
          text-align: center;
          position: relative;
        }

        .masthead::before {
          content: '';
          display: block;
          width: 100%;
          height: 1px;
          background: #3a3530;
          margin-bottom: 16px;
        }

        .masthead-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          color: #8a7e6e;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .masthead-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f0e8d8;
          line-height: 1;
          margin-bottom: 6px;
        }

        .masthead-sub {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 15px;
          color: #8a7e6e;
          font-weight: 400;
        }

        .divider-rule {
          border: none;
          border-top: 1px solid #3a3530;
          margin: 0;
        }

        .content {
          max-width: 860px;
          margin: 0 auto;
          padding: 40px 24px 0;
        }

        .section-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.3em;
          color: #6a5e4e;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .input-wrapper {
          position: relative;
          margin-bottom: 16px;
        }

        textarea {
          width: 100%;
          min-height: 220px;
          background: #141210;
          border: 1px solid #3a3530;
          border-radius: 2px;
          color: #c8bfaa;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          line-height: 1.7;
          padding: 20px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }

        textarea:focus { border-color: #c8913a; }
        textarea::placeholder { color: #4a4038; }

        .input-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .word-count {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: #5a5040;
        }

        .btn-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 10px 20px;
          border-radius: 2px;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: #c8913a;
          border-color: #c8913a;
          color: #0d0c0a;
          font-weight: 500;
        }

        .btn-primary:hover:not(:disabled) { background: #e0a845; border-color: #e0a845; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-ghost {
          background: transparent;
          border-color: #3a3530;
          color: #8a7e6e;
        }

        .btn-ghost:hover { border-color: #6a5e4e; color: #b0a890; }

        .spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-block {
          background: #141210;
          border: 1px solid #3a3530;
          border-left: 3px solid #c8913a;
          padding: 24px 28px;
          border-radius: 2px;
        }

        .loading-headline {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #c8913a;
          margin-bottom: 8px;
        }

        .loading-body {
          font-size: 13px;
          color: #6a5e4e;
          font-style: italic;
        }

        .error-block {
          background: #1a0e0e;
          border: 1px solid #6a2020;
          border-left: 3px solid #c84040;
          padding: 20px 24px;
          border-radius: 2px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: #c87070;
        }

        .result-section {
          margin-top: 40px;
        }

        .result-rule {
          border: none;
          border-top: 2px solid #3a3530;
          margin-bottom: 28px;
        }

        .result-headline {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: #f0e8d8;
          margin-bottom: 6px;
          font-weight: 700;
        }

        .result-deck {
          font-family: 'Source Serif 4', serif;
          font-style: italic;
          font-size: 14px;
          color: #6a5e4e;
          margin-bottom: 24px;
        }

        .tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid #3a3530;
          margin-bottom: 28px;
        }

        .tab {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 10px 18px;
          border: none;
          background: transparent;
          color: #5a5040;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.15s;
        }

        .tab:hover { color: #a09070; }

        .tab.active {
          color: #c8913a;
          border-bottom-color: #c8913a;
        }

        .text-block {
          background: #141210;
          border: 1px solid #2a2520;
          border-radius: 2px;
          padding: 28px 32px;
        }

        .text-block p {
          font-family: 'Source Serif 4', serif;
          font-size: 15px;
          line-height: 1.85;
          color: #c8bfaa;
          margin-bottom: 16px;
        }

        .text-block p:last-child { margin-bottom: 0; }

        .text-block.final p {
          color: #e0d8c8;
        }

        .text-block.draft p {
          color: #a09888;
        }

        .tells-list {
          list-style: none;
          padding: 0;
        }

        .tells-list li {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #1e1c18;
          font-size: 14px;
          color: #a09880;
          line-height: 1.5;
        }

        .tells-list li:last-child { border-bottom: none; }

        .tell-bullet {
          font-family: 'IBM Plex Mono', monospace;
          color: #c8913a;
          font-size: 12px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .changes-list {
          list-style: none;
          padding: 0;
        }

        .changes-list li {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #1e1c18;
          font-size: 13px;
          color: #8a8070;
          font-family: 'IBM Plex Mono', monospace;
          line-height: 1.5;
        }

        .changes-list li:last-child { border-bottom: none; }

        .change-tick {
          color: #5a8a5a;
          flex-shrink: 0;
        }

        .comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 32px;
        }

        @media (max-width: 600px) {
          .comparison { grid-template-columns: 1fr; }
          .masthead { padding: 24px 20px 16px; }
          .content { padding: 28px 16px 0; }
        }

        .comparison-col-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .comparison-col-label.before { color: #8a4040; }
        .comparison-col-label.after { color: #4a7a4a; }

        .comparison-text {
          background: #141210;
          border: 1px solid #2a2520;
          border-radius: 2px;
          padding: 20px;
          font-size: 13px;
          line-height: 1.75;
          color: #8a8070;
          height: 100%;
        }

        .comparison-text.after {
          color: #c8bfaa;
          border-color: #2a3a2a;
        }

        .api-key-bar {
          background: #141210;
          border: 1px solid #3a3530;
          border-radius: 2px;
          padding: 16px 20px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .api-key-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #6a5e4e;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .api-key-input-wrap {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .api-key-input {
          width: 100%;
          background: #0d0c0a;
          border: 1px solid #2a2520;
          border-radius: 2px;
          color: #c8bfaa;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          padding: 9px 38px 9px 12px;
          outline: none;
          transition: border-color 0.2s;
        }

        .api-key-input:focus { border-color: #c8913a; }
        .api-key-input::placeholder { color: #3a3530; }

        .api-key-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #5a5040;
          font-size: 13px;
          padding: 0;
          line-height: 1;
        }

        .api-key-toggle:hover { color: #a09070; }

        .api-key-hint {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: #4a4038;
          white-space: nowrap;
        }

        .api-key-hint a {
          color: #6a5848;
          text-decoration: underline;
        }

        .key-status {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          background: ${/* placeholder, will be dynamic */ "#3a3530"};
        }

          border: none;
          border-top: 3px double #3a3530;
          margin: 60px auto 0;
          max-width: 860px;
          padding: 0 24px;
        }

        .footer-note {
          text-align: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: #3a3530;
          letter-spacing: 0.15em;
          padding: 16px 24px;
        }
      `}</style>

      <div className="app">
        <div className="masthead">
          <div className="masthead-eyebrow">Editorial Tools — Writing Edition</div>
          <div className="masthead-title">The Humanizer</div>
          <div className="masthead-sub">Strip the AI out of your prose</div>
        </div>

        <hr className="divider-rule" />

        <div className="content">
          <div className="api-key-bar">
            <span className="api-key-label">Anthropic API Key</span>
            <div className="api-key-input-wrap">
              <input
                className="api-key-input"
                type={apiKeyVisible ? "text" : "password"}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                spellCheck={false}
              />
              <button className="api-key-toggle" onClick={() => setApiKeyVisible(v => !v)}>
                {apiKeyVisible ? "🙈" : "👁"}
              </button>
            </div>
            <span
              style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: apiKey.startsWith("sk-ant-") ? "#4a8a4a" : "#3a3530",
                boxShadow: apiKey.startsWith("sk-ant-") ? "0 0 6px #4a8a4a" : "none",
                transition: "all 0.3s",
              }}
            />
            <span className="api-key-hint">
              Get yours at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a>
            </span>
          </div>

          <div className="section-label">Paste your text below</div>

          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); if (stage !== "idle") setStage("idle"); }}
              placeholder="Paste any AI-sounding text here — blog posts, bios, marketing copy, essays, product descriptions..."
              disabled={stage === "loading"}
            />
          </div>

          <div className="input-meta">
            <span className="word-count">
              {wordCount(input)} words
            </span>
            <div className="btn-row">
              <button className="btn btn-ghost" onClick={loadExample} disabled={stage === "loading"}>
                Load Example
              </button>
              {(stage === "done" || stage === "error") && (
                <button className="btn btn-ghost" onClick={reset}>
                  Clear
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={humanize}
                disabled={!input.trim() || stage === "loading" || !apiKey.trim()}
              >
                {stage === "loading" ? <><Spinner /> Humanizing...</> : "Humanize →"}
              </button>
            </div>
          </div>

          {stage === "loading" && (
            <div className="loading-block">
              <div className="loading-headline">Working on it...</div>
              <div className="loading-body">Running the text through three stages: draft rewrite, AI-tell audit, final revision.</div>
            </div>
          )}

          {stage === "error" && (
            <div className="error-block">Error: {errorMsg}</div>
          )}

          {stage === "done" && result && (
            <div className="result-section">
              <hr className="result-rule" />
              <div className="result-headline">Humanized</div>
              <div className="result-deck">Three-stage rewrite — draft, audit, and final pass</div>

              <div className="tabs">
                {[
                  { id: "final", label: "Final" },
                  { id: "draft", label: "Draft" },
                  { id: "tells", label: "AI Tells" },
                  { id: "changes", label: "Changes" },
                  { id: "compare", label: "Compare" },
                ].map(t => (
                  <button
                    key={t.id}
                    className={`tab ${activeTab === t.id ? "active" : ""}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === "final" && (
                <div className="text-block final">
                  {result.final.split("\n\n").filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}

              {activeTab === "draft" && (
                <div className="text-block draft">
                  {result.draft.split("\n\n").filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}

              {activeTab === "tells" && (
                <div className="text-block">
                  <ul className="tells-list">
                    {result.tells.map((t, i) => (
                      <li key={i}>
                        <span className="tell-bullet">#{i + 1}</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "changes" && (
                <div className="text-block">
                  <ul className="changes-list">
                    {result.changes.map((c, i) => (
                      <li key={i}>
                        <span className="change-tick">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "compare" && (
                <div className="comparison">
                  <div>
                    <div className="comparison-col-label before">Original</div>
                    <div className="comparison-text">
                      {input}
                    </div>
                  </div>
                  <div>
                    <div className="comparison-col-label after">Humanized</div>
                    <div className="comparison-text after">
                      {result.final}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className="footer-rule" style={{ maxWidth: "860px", margin: "60px auto 0" }} />
        <div className="footer-note">
          Based on Wikipedia's Signs of AI Writing
        </div>
      </>
      );
}
