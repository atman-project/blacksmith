import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// --- Icons ---
const Icons = {
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Undo: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  Save: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  History: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Anvil: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16h16v2H4z" /><path d="M6 12h12l2 4H4l2-4z" /><path d="M8 12V8a4 4 0 0 1 8 0v4" /><path d="M10 8h4" />
    </svg>
  ),
  Branch: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
  Dot: () => (
    <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor" /></svg>
  ),
  Close: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Back: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Publish: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  ),
  Menu: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  File: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Trash: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Sidebar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  ),
  Eye: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Code: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
};

// --- Diff Engine (LCS-based) ---
function computeDiff(oldText, newText) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const m = oldLines.length, n = newLines.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = oldLines[i-1] === newLines[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);

  const allLines = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i-1] === newLines[j-1]) {
      allLines.push({ type: "ctx", content: oldLines[i-1], oldNum: i, newNum: j }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      allLines.push({ type: "add", content: newLines[j-1], newNum: j }); j--;
    } else {
      allLines.push({ type: "del", content: oldLines[i-1], oldNum: i }); i--;
    }
  }
  allLines.reverse();

  const CTX = 3, hunks = [];
  let hunk = null, lastChangeAt = -999;
  allLines.forEach((line, idx) => {
    if (line.type !== "ctx") {
      if (idx - lastChangeAt > CTX*2+1 && hunk) {
        for (let c = lastChangeAt+1; c < Math.min(lastChangeAt+CTX+1, idx); c++) if (allLines[c]) hunk.lines.push(allLines[c]);
        hunks.push(hunk); hunk = null;
      }
      if (!hunk) { hunk = { lines: [] }; for (let c = Math.max(0, idx-CTX); c < idx; c++) hunk.lines.push(allLines[c]); }
      else { for (let c = lastChangeAt+1; c < idx; c++) hunk.lines.push(allLines[c]); }
      hunk.lines.push(line); lastChangeAt = idx;
    }
  });
  if (hunk) {
    for (let c = lastChangeAt+1; c < Math.min(lastChangeAt+CTX+1, allLines.length); c++) if (allLines[c]) hunk.lines.push(allLines[c]);
    hunks.push(hunk);
  }

  // Pair del/add for inline highlights
  hunks.forEach(h => {
    for (let k = 0; k < h.lines.length; k++) {
      if (h.lines[k].type === "del") {
        let ds = k; while (k < h.lines.length && h.lines[k].type === "del") k++;
        let de = k, as_ = k;
        while (k < h.lines.length && h.lines[k].type === "add") k++;
        let ae = k, pairs = Math.min(de-ds, ae-as_);
        for (let p = 0; p < pairs; p++) { h.lines[ds+p].pair = h.lines[as_+p]; h.lines[as_+p].pair = h.lines[ds+p]; }
        k--;
      }
    }
  });

  let additions = 0, deletions = 0;
  allLines.forEach(l => { if (l.type === "add") additions++; if (l.type === "del") deletions++; });
  return { hunks, additions, deletions };
}

// --- Character-level inline diff ---
function computeInlineDiff(oldStr, newStr) {
  if (oldStr === newStr) return { oldSegments: [{ text: oldStr, highlight: false }], newSegments: [{ text: newStr, highlight: false }] };
  const m = oldStr.length, n = newStr.length;
  if (m * n > 500000) return { oldSegments: [{ text: oldStr, highlight: true }], newSegments: [{ text: newStr, highlight: true }] };
  const dp = Array.from({ length: m+1 }, () => new Uint16Array(n+1));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = oldStr[i-1] === newStr[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
  const oldKeep = new Uint8Array(m), newKeep = new Uint8Array(n);
  let ci = m, cj = n;
  while (ci > 0 && cj > 0) {
    if (oldStr[ci-1] === newStr[cj-1]) { oldKeep[ci-1] = 1; newKeep[cj-1] = 1; ci--; cj--; }
    else if (dp[ci-1][cj] >= dp[ci][cj-1]) ci--; else cj--;
  }
  function buildSegments(str, keep) {
    const segs = []; let k = 0;
    while (k < str.length) { const hl = !keep[k]; let end = k; while (end < str.length && !keep[end] === hl) end++; segs.push({ text: str.slice(k, end), highlight: hl }); k = end; }
    return segs;
  }
  return { oldSegments: buildSegments(oldStr, oldKeep), newSegments: buildSegments(newStr, newKeep) };
}

// --- Diff View ---
function DiffView({ oldDoc, newDoc, commitMsg, commitTime, commitHash, onBack, onRestore }) {
  const diff = useMemo(() => computeDiff(oldDoc, newDoc), [oldDoc, newDoc]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 4, display: "flex", alignItems: "center", transition: "color 0.1s" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}><Icons.Back /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{commitMsg}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{commitTime}</span>
            {commitHash && <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)", background: "var(--accent-glow)", padding: "1px 5px", borderRadius: 3 }}>{commitHash}</span>}
          </div>
        </div>
      </div>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 14, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        <span style={{ color: "#4ae28a" }}>+{diff.additions}</span>
        <span style={{ color: "#e25a5a" }}>−{diff.deletions}</span>
        {(diff.additions + diff.deletions) > 0 && (
          <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
            {Array.from({ length: Math.min(diff.additions, 20) }).map((_, i) => <div key={`a${i}`} style={{ width: 5, height: 5, background: "#4ae28a", borderRadius: 1, opacity: 0.7 }} />)}
            {Array.from({ length: Math.min(diff.deletions, 20) }).map((_, i) => <div key={`d${i}`} style={{ width: 5, height: 5, background: "#e25a5a", borderRadius: 1, opacity: 0.7 }} />)}
          </div>
        )}
        <div style={{ flex: 1 }} />
        {onRestore && <button onClick={onRestore} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "1px solid var(--accent-dim)", borderRadius: 4, padding: "3px 10px", cursor: "pointer", fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>RESTORE</button>}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "4px 0" }}>
        {diff.hunks.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>No changes</div>
        ) : diff.hunks.map((hunk, hi) => (
          <div key={hi}>
            {hi > 0 && <div style={{ padding: "6px 0", fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textAlign: "center", background: "var(--surface)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", letterSpacing: "0.3em" }}>···</div>}
            {hunk.lines.map((line, li) => {
              const isAdd = line.type === "add", isDel = line.type === "del";
              return (
                <div key={`${hi}-${li}`} style={{ display: "flex", fontSize: 12, lineHeight: "22px", fontFamily: "var(--font-mono)", background: isAdd ? "rgba(74,226,138,0.06)" : isDel ? "rgba(226,90,90,0.06)" : "transparent", borderLeft: `3px solid ${isAdd ? "rgba(74,226,138,0.5)" : isDel ? "rgba(226,90,90,0.5)" : "transparent"}` }}>
                  <div style={{ width: 36, flexShrink: 0, textAlign: "right", paddingRight: 4, color: isDel ? "rgba(226,90,90,0.4)" : isAdd ? "transparent" : "var(--border)", userSelect: "none", fontSize: 10.5 }}>{!isAdd ? (line.oldNum || "") : ""}</div>
                  <div style={{ width: 36, flexShrink: 0, textAlign: "right", paddingRight: 8, color: isAdd ? "rgba(74,226,138,0.4)" : isDel ? "transparent" : "var(--border)", userSelect: "none", fontSize: 10.5 }}>{!isDel ? (line.newNum || "") : ""}</div>
                  <div style={{ width: 16, flexShrink: 0, textAlign: "center", color: isAdd ? "#4ae28a" : isDel ? "#e25a5a" : "transparent", fontWeight: 700, userSelect: "none" }}>{isAdd ? "+" : isDel ? "−" : " "}</div>
                  <div style={{ flex: 1, paddingRight: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", color: isAdd ? "#4ae28a" : isDel ? "#e25a5a" : "var(--text-secondary)", opacity: isAdd || isDel ? 1 : 0.6 }}>
                    {(() => {
                      if (!line.pair || !line.content) return line.content || "\u00A0";
                      const inline = computeInlineDiff(isDel ? line.content : line.pair.content, isAdd ? line.content : line.pair.content);
                      const segments = isDel ? inline.oldSegments : inline.newSegments;
                      const hlColor = isAdd ? "rgba(74,226,138,0.25)" : "rgba(226,90,90,0.25)";
                      return segments.map((seg, si) => seg.highlight ? <span key={si} style={{ background: hlColor, borderRadius: 2, padding: "1px 0" }}>{seg.text}</span> : <span key={si}>{seg.text}</span>);
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- History Panel ---
function HistoryPanel({ commits, onRestore, onClose, initialDoc }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const getPrevDoc = (idx) => idx === commits.length - 1 ? initialDoc : commits[idx + 1].doc;

  if (selectedIdx !== null) {
    const c = commits[selectedIdx];
    return (
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 520, background: "var(--surface-elevated)", borderLeft: "1px solid var(--border)", zIndex: 100, display: "flex", flexDirection: "column", animation: "slideIn 0.2s ease-out" }}>
        <DiffView oldDoc={getPrevDoc(selectedIdx)} newDoc={c.doc} commitMsg={c.message} commitTime={c.time} commitHash={c.hash}
          onBack={() => setSelectedIdx(null)} onRestore={selectedIdx > 0 ? () => { onRestore(c); setSelectedIdx(null); } : null} />
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 340, background: "var(--surface-elevated)", borderLeft: "1px solid var(--border)", zIndex: 100, display: "flex", flexDirection: "column", animation: "slideIn 0.2s ease-out" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "0.02em" }}>HISTORY</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 4, display: "flex", alignItems: "center" }}><Icons.Close /></button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
        {commits.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0", textAlign: "center", fontFamily: "var(--font-mono)" }}>No commits yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {commits.map((c, i) => {
              const stats = computeDiff(getPrevDoc(i), c.doc);
              return (
                <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 8, background: i === 0 ? "var(--accent)" : "var(--text-muted)", opacity: i === 0 ? 1 : 0.4, border: i === 0 ? "2px solid var(--accent-dim)" : "2px solid transparent", boxSizing: "border-box" }} />
                    {i < commits.length - 1 && <div style={{ width: 1.5, flex: 1, background: "var(--border)", marginTop: 4, marginBottom: 4 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 16, cursor: "pointer", borderRadius: 6, padding: "6px 8px", marginLeft: -4, transition: "background 0.1s" }}
                    onClick={() => setSelectedIdx(i)} onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 3 }}>{c.message}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{c.time}</span>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)", background: "var(--accent-glow)", padding: "0 4px", borderRadius: 2, opacity: 0.8 }}>{c.hash}</span>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#4ae28a", opacity: 0.7 }}>+{stats.additions}</span>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#e25a5a", opacity: 0.7 }}>−{stats.deletions}</span>
                    </div>
                    {i > 0 && <button onClick={e => { e.stopPropagation(); onRestore(c); }} style={{ marginTop: 6, fontSize: 11, color: "var(--accent)", background: "none", border: "1px solid var(--accent-dim)", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>RESTORE</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Commit Dialog ---
function CommitDialog({ onCommit, onCancel }) {
  const [msg, setMsg] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.15s ease-out" }}>
      <div style={{ background: "var(--surface-elevated)", borderRadius: 10, padding: 24, width: 380, border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>COMMIT CHANGES</div>
        <input ref={inputRef} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && msg.trim()) onCommit(msg.trim()); }}
          placeholder="Describe your changes..." style={{ width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-body)" }} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={onCancel} style={{ padding: "7px 16px", fontSize: 12, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontFamily: "var(--font-mono)" }}>CANCEL</button>
          <button onClick={() => msg.trim() && onCommit(msg.trim())} style={{ padding: "7px 16px", fontSize: 12, borderRadius: 6, border: "none", background: msg.trim() ? "var(--accent)" : "var(--border)", color: msg.trim() ? "#000" : "var(--text-muted)", cursor: msg.trim() ? "pointer" : "default", fontFamily: "var(--font-mono)", fontWeight: 600 }}>COMMIT</button>
        </div>
      </div>
    </div>
  );
}

// --- Toast ---
function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-mono)", background: "var(--surface-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", boxShadow: "0 8px 30px rgba(0,0,0,0.2)", animation: "slideUp 0.25s ease-out", zIndex: 300, letterSpacing: "0.01em" }}>
      {message}
    </div>
  );
}

// --- Simulated AI ---
function getAIResponse(userMsg, currentDoc) {
  const msg = userMsg.toLowerCase();
  let newDoc = currentDoc, reply = "";
  if (msg.includes("add") && msg.includes("section")) {
    const t = userMsg.replace(/add\s*(a\s*)?section\s*(about|on|for|called|titled)?\s*/i, "").trim() || "New Section";
    const cap = t.charAt(0).toUpperCase() + t.slice(1);
    newDoc = currentDoc + `\n\n## ${cap}\n\nThis section covers ${cap.toLowerCase()}. Start writing here...\n`;
    reply = `Added a new section: **${cap}**.`;
  } else if (msg.includes("add") && msg.includes("todo")) {
    newDoc = currentDoc + `\n\n## TODO\n\n- [ ] First task\n- [ ] Second task\n- [ ] Third task\n`;
    reply = "Added a TODO section with placeholder tasks.";
  } else if (msg.includes("summarize") || msg.includes("summary")) {
    reply = "Your document covers the current sections with their content. It's structured and ready for further shaping.";
  } else if (msg.includes("clear") || msg.includes("reset")) {
    newDoc = "# Untitled\n\nStart writing...\n";
    reply = "Document cleared. A fresh canvas awaits.";
  } else if (msg.includes("title") || msg.includes("rename")) {
    const title = userMsg.replace(/.*(?:title|rename)\s*(?:to|it|this)?\s*/i, "").trim() || "Untitled";
    newDoc = currentDoc.replace(/^#\s+.+/m, `# ${title}`);
    reply = `Updated the title to **${title}**.`;
  } else {
    reply = `I understand you want to: "${userMsg}". Try:\n\n- "Add a section about [topic]"\n- "Add a todo list"\n- "Rename to [new title]"\n- "Clear the document"`;
  }
  return { reply, newDoc };
}

// --- Helper: extract title from doc ---
function extractTitle(doc) {
  const match = doc.match(/^#\s+(.+)/m);
  return match ? match[1].replace(/\*\*/g, "") : "Untitled";
}

// --- Helper: create a new blank app ---
let nextId = 2;
function createNewApp() {
  const id = `app-${nextId++}`;
  return {
    id, doc: INITIAL_DOC, lastCommittedDoc: INITIAL_DOC,
    messages: [{ role: "assistant", content: "Welcome to the Blacksmith forge. I can help you shape your document — ask me to add sections, restructure content, change tone, or transform it entirely." }],
    commits: [],
  };
}

const INITIAL_DOC = `# Welcome to Blacksmith

Blacksmith is a **doc-to-app framework** — part of the Atman Project.

## What is this?

This is your workspace. The document you're reading right now is a *living document*. You can edit it directly, or use the chat on the left to transform it.

## How it works

- **Chat** with Blacksmith to shape your document
- **Edit** the note directly on the right
- **Commit** your changes to create save points
- **Revert** to undo uncommitted changes
- **History** to browse your commit timeline

## Philosophy

> Your memories you will never lose.
> Software shifts. Your data shouldn't.

Data is not static. It is something to be **forged**.
`;

const INITIAL_APP = {
  id: "app-1",
  doc: INITIAL_DOC,
  lastCommittedDoc: INITIAL_DOC,
  messages: [{ role: "assistant", content: "Welcome to the Blacksmith forge. I can help you shape your document — ask me to add sections, restructure content, change tone, or transform it entirely." }],
  commits: [],
};

// --- Simple Markdown Renderer ---
function RenderedMarkdown({ content }) {
  const html = useMemo(() => {
    let out = content
      // Escape HTML
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      // Headings
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Bold + Italic
      .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Checkboxes
      .replace(/^- \[x\] (.+)$/gm, '<div class="md-check checked">$1</div>')
      .replace(/^- \[ \] (.+)$/gm, '<div class="md-check">$1</div>')
      // Unordered list
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr/>')
      // Paragraphs (double newline)
      .replace(/\n\n/g, '</p><p>')
      // Single newlines within paragraphs
      .replace(/\n/g, '<br/>');

    // Wrap consecutive <li> in <ul>
    out = out.replace(/((?:<li>.*?<\/li>(?:<br\/>)?)+)/g, '<ul>$1</ul>');
    // Clean up br inside ul
    out = out.replace(/<ul>(.*?)<\/ul>/gs, (m, inner) => '<ul>' + inner.replace(/<br\/>/g, '') + '</ul>');
    // Merge consecutive blockquotes
    out = out.replace(/<\/blockquote>(?:<br\/>|<\/p><p>)*<blockquote>/g, '<br/>');

    return '<p>' + out + '</p>';
  }, [content]);

  return (
    <div className="rendered-md" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

// --- Main App ---
export default function Blacksmith() {
  const [apps, setApps] = useState([INITIAL_APP]);
  const [activeId, setActiveId] = useState("app-1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [toast, setToast] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [viewMode, setViewMode] = useState("rendered"); // "markdown" | "rendered"

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const app = apps.find(a => a.id === activeId) || apps[0];
  const isDirty = app.doc !== app.lastCommittedDoc;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [app.messages, isTyping]);

  const updateApp = useCallback((id, updater) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, ...updater(a) } : a));
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    updateApp(activeId, a => ({ messages: [...a.messages, { role: "user", content: trimmed }] }));
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const currentApp = apps.find(a => a.id === activeId);
      const { reply, newDoc } = getAIResponse(trimmed, currentApp?.doc || "");
      updateApp(activeId, a => ({
        doc: newDoc,
        messages: [...a.messages, { role: "user", content: trimmed }, { role: "assistant", content: reply }].filter((m, i, arr) => {
          // dedupe user msg already added
          if (m.role === "user" && m.content === trimmed && i > 0) {
            const prevSame = arr.slice(0, i).filter(x => x.role === "user" && x.content === trimmed).length;
            return prevSame === 0;
          }
          return true;
        }),
      }));
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }, [input, activeId, apps, updateApp]);

  const handleRevert = () => {
    if (!isDirty) return;
    updateApp(activeId, a => ({ doc: a.lastCommittedDoc }));
    setToast("Reverted to last commit");
  };

  const handleCommit = (message) => {
    const now = new Date();
    const time = now.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    updateApp(activeId, a => ({
      commits: [{ message, doc: a.doc, time, hash: Math.random().toString(36).slice(2, 9) }, ...a.commits],
      lastCommittedDoc: a.doc,
    }));
    setShowCommitDialog(false);
    setToast(`Committed: ${message}`);
  };

  const handleRestore = (commit) => {
    updateApp(activeId, () => ({ doc: commit.doc, lastCommittedDoc: commit.doc }));
    setShowHistory(false);
    setToast(`Restored: ${commit.message}`);
  };

  const handleNewApp = () => {
    const newApp = createNewApp();
    setApps(prev => [...prev, newApp]);
    setActiveId(newApp.id);
    setShowHistory(false);
    setInput("");
  };

  const handleDeleteApp = (id) => {
    if (apps.length <= 1) return;
    setApps(prev => prev.filter(a => a.id !== id));
    if (activeId === id) setActiveId(apps.find(a => a.id !== id)?.id || apps[0].id);
  };

  const handleSwitchApp = (id) => {
    setActiveId(id);
    setShowHistory(false);
    setInput("");
  };

  const SIDEBAR_W = sidebarOpen ? 220 : 48;

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", background: "var(--surface)", color: "var(--text-primary)", fontFamily: "var(--font-body)", overflow: "hidden" }}>
      <style>{`
        :root {
          --surface: #111113; --surface-elevated: #1a1a1f; --surface-hover: #222228;
          --border: #2a2a32; --border-subtle: #1f1f27;
          --text-primary: #e8e6e3; --text-secondary: #9d9b97; --text-muted: #5c5a57;
          --accent: #e2a04a; --accent-dim: rgba(226,160,74,0.2); --accent-glow: rgba(226,160,74,0.08);
          --user-bubble: #252530;
          --sidebar-bg: #0d0d0f;
          --font-display: 'Instrument Serif', Georgia, serif;
          --font-body: 'DM Sans', -apple-system, sans-serif;
          --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
        }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: var(--accent-dim); color: var(--accent); }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideUp { from { transform: translate(-50%,10px); opacity: 0; } to { transform: translate(-50%,0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%,80%,100% { opacity: 0.3; } 40% { opacity: 1; } }
        .toolbar-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 11.5px; font-weight: 500; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; font-family: var(--font-mono); letter-spacing: 0.04em; transition: all 0.15s ease; white-space: nowrap; }
        .toolbar-btn:hover { background: var(--surface-hover); color: var(--text-primary); border-color: var(--text-muted); }
        .toolbar-btn:active { transform: scale(0.97); }
        .toolbar-btn.accent { border-color: var(--accent-dim); color: var(--accent); }
        .toolbar-btn.accent:hover { background: var(--accent-dim); }
        .toolbar-btn:disabled { opacity: 0.3; cursor: default; }
        .toolbar-btn:disabled:hover { background: transparent; color: var(--text-secondary); border-color: var(--border); }
        .note-editor { width: 100%; height: 100%; resize: none; border: none; outline: none; background: transparent; color: var(--text-primary); font-family: var(--font-body); font-size: 14.5px; line-height: 1.75; padding: 32px 40px; letter-spacing: 0.005em; }
        .note-editor::placeholder { color: var(--text-muted); }
        .chat-input-area { display: flex; align-items: flex-end; gap: 8px; padding: 14px 16px; border-top: 1px solid var(--border); background: var(--surface); }
        .chat-input { flex: 1; resize: none; border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; font-size: 13px; background: var(--surface-elevated); color: var(--text-primary); outline: none; font-family: var(--font-body); line-height: 1.5; max-height: 120px; min-height: 40px; transition: border-color 0.15s ease; }
        .chat-input:focus { border-color: var(--accent-dim); }
        .chat-input::placeholder { color: var(--text-muted); }
        .send-btn { width: 36px; height: 36px; border-radius: 8px; border: none; background: var(--accent); color: #000; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s ease; }
        .send-btn:hover { filter: brightness(1.1); } .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { background: var(--border); cursor: default; color: var(--text-muted); }
        .rendered-md { padding: 32px 40px; color: var(--text-primary); font-family: var(--font-body); font-size: 14.5px; line-height: 1.75; letter-spacing: 0.005em; }
        .rendered-md h1 { font-family: var(--font-display); font-size: 28px; font-weight: 400; margin: 0 0 16px 0; color: var(--text-primary); line-height: 1.3; }
        .rendered-md h2 { font-family: var(--font-display); font-size: 21px; font-weight: 400; margin: 28px 0 12px 0; color: var(--text-primary); line-height: 1.3; padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle); }
        .rendered-md h3 { font-size: 16px; font-weight: 600; margin: 20px 0 8px 0; color: var(--text-primary); }
        .rendered-md p { margin: 0 0 12px 0; }
        .rendered-md strong { color: var(--text-primary); font-weight: 600; }
        .rendered-md em { color: var(--text-secondary); font-style: italic; }
        .rendered-md code { background: var(--surface); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 12.5px; color: var(--accent); }
        .rendered-md blockquote { border-left: 3px solid var(--accent-dim); padding: 8px 16px; margin: 12px 0; color: var(--text-secondary); font-style: italic; background: var(--accent-glow); border-radius: 0 6px 6px 0; }
        .rendered-md ul { margin: 8px 0; padding-left: 20px; }
        .rendered-md li { margin: 4px 0; color: var(--text-secondary); }
        .rendered-md li strong { color: var(--text-primary); }
        .rendered-md hr { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
        .rendered-md .md-check { display: flex; align-items: center; gap: 8px; padding: 4px 0; color: var(--text-secondary); }
        .rendered-md .md-check::before { content: ''; width: 14px; height: 14px; border-radius: 3px; border: 1.5px solid var(--border); flex-shrink: 0; }
        .rendered-md .md-check.checked::before { background: var(--accent); border-color: var(--accent); }
        .sidebar-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: all 0.1s ease; font-size: 13px; color: var(--text-secondary); position: relative; }
        .sidebar-item:hover { background: var(--surface-hover); color: var(--text-primary); }
        .sidebar-item.active { background: var(--accent-glow); color: var(--text-primary); border-left: 2px solid var(--accent); }
        .sidebar-item .delete-btn { opacity: 0; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; border-radius: 3px; display: flex; align-items: center; transition: opacity 0.1s; }
        .sidebar-item:hover .delete-btn { opacity: 1; }
        .sidebar-item .delete-btn:hover { color: #e25a5a; }
      `}</style>

      {/* === APP SIDEBAR === */}
      <div style={{
        width: SIDEBAR_W, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)",
        transition: "width 0.2s ease", overflow: "hidden",
      }}>
        {/* Sidebar header */}
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: sidebarOpen ? "0 12px" : "0", justifyContent: sidebarOpen ? "space-between" : "center", borderBottom: "1px solid var(--border)" }}>
          {sidebarOpen && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-muted)", letterSpacing: "0.06em" }}>APPS</span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 6, borderRadius: 4, display: "flex", alignItems: "center", transition: "color 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
            <Icons.Sidebar />
          </button>
        </div>

        {/* App list */}
        <div style={{ flex: 1, overflow: "auto", padding: sidebarOpen ? "8px" : "8px 4px" }}>
          {apps.map(a => {
            const title = extractTitle(a.doc);
            const isActive = a.id === activeId;
            const hasChanges = a.doc !== a.lastCommittedDoc;
            if (!sidebarOpen) {
              return (
                <div key={a.id} onClick={() => handleSwitchApp(a.id)}
                  style={{ width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", margin: "4px auto", position: "relative",
                    background: isActive ? "var(--accent-glow)" : "transparent",
                    border: isActive ? "1px solid var(--accent-dim)" : "1px solid transparent",
                    color: isActive ? "var(--accent)" : "var(--text-muted)", transition: "all 0.1s",
                  }}
                  onMouseEnter={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const tip = document.getElementById(`tip-${a.id}`);
                    if (tip) { tip.style.opacity = '1'; tip.style.top = `${rect.top + rect.height / 2}px`; tip.style.left = `${rect.right + 8}px`; }
                  }}
                  onMouseLeave={() => { const tip = document.getElementById(`tip-${a.id}`); if (tip) tip.style.opacity = '0'; }}>
                  <Icons.File />
                </div>
              );
            }
            return (
              <div key={a.id} className={`sidebar-item ${isActive ? "active" : ""}`} onClick={() => handleSwitchApp(a.id)}
                onMouseEnter={e => { const btn = e.currentTarget.querySelector('[data-delete]'); if (btn) btn.style.opacity = '1'; }}
                onMouseLeave={e => { const btn = e.currentTarget.querySelector('[data-delete]'); if (btn) btn.style.opacity = '0'; }}>
                <Icons.File />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12.5 }}>
                  {title}
                </span>
                {hasChanges && <span style={{ color: "var(--accent)", flexShrink: 0 }}><Icons.Dot /></span>}
                {apps.length > 1 && (
                  <button data-delete onClick={e => { e.stopPropagation(); handleDeleteApp(a.id); }}
                    style={{ opacity: 0, position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 3, display: "flex", alignItems: "center", transition: "opacity 0.1s, color 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#e25a5a"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                    <Icons.Trash />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* New app button */}
        <div style={{ padding: sidebarOpen ? "8px 12px" : "8px 4px", borderTop: "1px solid var(--border)" }}>
          {sidebarOpen ? (
            <button onClick={handleNewApp} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px 0", borderRadius: 6, border: "1px dashed var(--border)",
              background: "transparent", color: "var(--text-muted)", cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em",
              transition: "all 0.15s",
            }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-dim)"; e.currentTarget.style.color = "var(--accent)"; }}
               onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
              <Icons.Plus /> NEW APP
            </button>
          ) : (
            <button onClick={handleNewApp} style={{
              width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px dashed var(--border)", background: "transparent", color: "var(--text-muted)",
              cursor: "pointer", margin: "0 auto", transition: "all 0.15s",
            }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-dim)"; e.currentTarget.style.color = "var(--accent)"; }}
               onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
              <Icons.Plus />
            </button>
          )}
        </div>
      </div>

      {/* === MAIN AREA === */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TOP BAR */}
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ color: "var(--accent)", display: "flex", alignItems: "center" }}><Icons.Anvil /></div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-primary)", letterSpacing: "0.01em" }}>Blacksmith</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.06em", marginLeft: 2 }}>FORGE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isDirty && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 8, fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", animation: "fadeIn 0.2s ease-out" }}>
                <Icons.Dot /> UNSAVED
              </div>
            )}
            <button className="toolbar-btn" onClick={handleRevert} disabled={!isDirty}><Icons.Undo /> REVERT</button>
            <button className="toolbar-btn accent" onClick={() => setShowCommitDialog(true)} disabled={!isDirty}><Icons.Save /> COMMIT</button>
            <button className="toolbar-btn" onClick={() => setShowHistory(!showHistory)}>
              <Icons.History /> HISTORY
              {app.commits.length > 0 && <span style={{ background: "var(--accent-dim)", color: "var(--accent)", fontSize: 10, padding: "1px 5px", borderRadius: 10, fontWeight: 600 }}>{app.commits.length}</span>}
            </button>
            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
            <button className="toolbar-btn" onClick={() => setToast("Publish is coming soon")}><Icons.Publish /> PUBLISH</button>
          </div>
        </div>

        {/* WORKSPACE */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

          {/* CHAT */}
          <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--surface)" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.Branch />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-muted)", letterSpacing: "0.04em" }}>FORGE CHAT</span>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {app.messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "fadeIn 0.25s ease-out" }}>
                    <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: 10, fontSize: 13, lineHeight: 1.6, background: m.role === "user" ? "var(--user-bubble)" : "transparent", color: m.role === "user" ? "var(--text-primary)" : "var(--text-secondary)", border: m.role === "user" ? "1px solid var(--border)" : "none", fontFamily: "var(--font-body)" }}>
                      {m.content.split("\n").map((line, j) => (
                        <div key={j} style={{ marginBottom: line === "" ? 8 : 0 }}>
                          {line.split(/(\*\*[^*]+\*\*)/g).map((part, k) => {
                            if (part.startsWith("**") && part.endsWith("**")) return <strong key={k} style={{ color: "var(--text-primary)", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
                            return <span key={k}>{part}</span>;
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display: "flex", gap: 4, padding: "10px 4px" }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--text-muted)", animation: `pulse 1.2s ${i * 0.15}s ease-in-out infinite` }} />)}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
            <div className="chat-input-area">
              <textarea ref={textareaRef} className="chat-input" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Shape your document..." rows={1} />
              <button className="send-btn" onClick={handleSend} disabled={!input.trim()}><Icons.Send /></button>
            </div>
          </div>

          {/* NOTE VIEW */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--surface-elevated)", position: "relative" }}>
            <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-muted)", letterSpacing: "0.04em" }}>DOCUMENT</span>
                {isDirty && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", opacity: 0.7 }}>(modified)</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-muted)" }}>{app.doc.split("\n").length} lines</span>
                <div style={{ display: "flex", borderRadius: 5, border: "1px solid var(--border)", overflow: "hidden" }}>
                  <button onClick={() => setViewMode("rendered")}
                    onMouseEnter={e => { const lbl = e.currentTarget.querySelector('[data-label]'); if (lbl) { lbl.style.width = 'auto'; lbl.style.opacity = '1'; lbl.style.marginLeft = '4px'; } }}
                    onMouseLeave={e => { const lbl = e.currentTarget.querySelector('[data-label]'); if (lbl) { lbl.style.width = '0'; lbl.style.opacity = '0'; lbl.style.marginLeft = '0'; } }}
                    style={{
                      display: "flex", alignItems: "center", padding: "4px 7px", border: "none", cursor: "pointer", transition: "all 0.1s",
                      background: viewMode === "rendered" ? "var(--surface-hover)" : "transparent",
                      color: viewMode === "rendered" ? "var(--text-primary)" : "var(--text-muted)",
                    }}>
                    <Icons.Eye />
                    <span data-label style={{ overflow: "hidden", width: 0, opacity: 0, fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.03em", whiteSpace: "nowrap", transition: "all 0.15s ease" }}>Preview</span>
                  </button>
                  <button onClick={() => setViewMode("markdown")}
                    onMouseEnter={e => { const lbl = e.currentTarget.querySelector('[data-label]'); if (lbl) { lbl.style.width = 'auto'; lbl.style.opacity = '1'; lbl.style.marginLeft = '4px'; } }}
                    onMouseLeave={e => { const lbl = e.currentTarget.querySelector('[data-label]'); if (lbl) { lbl.style.width = '0'; lbl.style.opacity = '0'; lbl.style.marginLeft = '0'; } }}
                    style={{
                      display: "flex", alignItems: "center", padding: "4px 7px", border: "none", borderLeft: "1px solid var(--border)", cursor: "pointer", transition: "all 0.1s",
                      background: viewMode === "markdown" ? "var(--surface-hover)" : "transparent",
                      color: viewMode === "markdown" ? "var(--text-primary)" : "var(--text-muted)",
                    }}>
                    <Icons.Code />
                    <span data-label style={{ overflow: "hidden", width: 0, opacity: 0, fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.03em", whiteSpace: "nowrap", transition: "all 0.15s ease" }}>Markdown</span>
                  </button>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              {viewMode === "markdown" ? (
                <textarea className="note-editor" value={app.doc} onChange={e => updateApp(activeId, () => ({ doc: e.target.value }))} spellCheck={false} />
              ) : (
                <RenderedMarkdown content={app.doc} />
              )}
            </div>
          </div>

          {showHistory && <HistoryPanel commits={app.commits} onRestore={handleRestore} onClose={() => setShowHistory(false)} initialDoc={app.lastCommittedDoc === app.commits[app.commits.length - 1]?.doc ? INITIAL_DOC : app.lastCommittedDoc} />}
        </div>
      </div>

      {showCommitDialog && <CommitDialog onCommit={handleCommit} onCancel={() => setShowCommitDialog(false)} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Tooltips for collapsed sidebar — rendered at root to escape overflow:hidden */}
      {!sidebarOpen && apps.map(a => (
        <div key={`tip-${a.id}`} id={`tip-${a.id}`} style={{
          position: "fixed", transform: "translateY(-50%)",
          background: "var(--surface-elevated)", border: "1px solid var(--border)",
          color: "var(--text-primary)", fontSize: 11.5, fontFamily: "var(--font-body)",
          padding: "5px 10px", borderRadius: 5, whiteSpace: "nowrap",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)", opacity: 0, transition: "opacity 0.15s ease",
          pointerEvents: "none", zIndex: 999,
        }}>
          {extractTitle(a.doc)}
        </div>
      ))}
    </div>
  );
}
