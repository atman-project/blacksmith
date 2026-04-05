import type { DiffResult, DiffLine, InlineDiffResult } from "../types";

export function computeDiff(oldText: string, newText: string): DiffResult {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const m = oldLines.length,
    n = newLines.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        oldLines[i - 1] === newLines[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);

  const allLines: DiffLine[] = [];
  let i = m,
    j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      allLines.push({
        type: "ctx",
        content: oldLines[i - 1],
        oldNum: i,
        newNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      allLines.push({ type: "add", content: newLines[j - 1], newNum: j });
      j--;
    } else {
      allLines.push({ type: "del", content: oldLines[i - 1], oldNum: i });
      i--;
    }
  }
  allLines.reverse();

  const CTX = 3;
  type HunkAccum = { lines: DiffLine[] };
  const hunks: HunkAccum[] = [];
  let hunk: HunkAccum | null = null;
  let lastChangeAt = -999;
  allLines.forEach((line, idx) => {
    if (line.type !== "ctx") {
      if (idx - lastChangeAt > CTX * 2 + 1 && hunk) {
        for (
          let c = lastChangeAt + 1;
          c < Math.min(lastChangeAt + CTX + 1, idx);
          c++
        )
          if (allLines[c]) hunk.lines.push(allLines[c]);
        hunks.push(hunk);
        hunk = null;
      }
      if (!hunk) {
        hunk = { lines: [] };
        for (let c = Math.max(0, idx - CTX); c < idx; c++)
          hunk.lines.push(allLines[c]);
      } else {
        for (let c = lastChangeAt + 1; c < idx; c++)
          hunk.lines.push(allLines[c]);
      }
      hunk.lines.push(line);
      lastChangeAt = idx;
    }
  });
  const finalHunk = hunk as HunkAccum | null;
  if (finalHunk) {
    for (
      let c = lastChangeAt + 1;
      c < Math.min(lastChangeAt + CTX + 1, allLines.length);
      c++
    )
      if (allLines[c]) finalHunk.lines.push(allLines[c]);
    hunks.push(finalHunk);
  }

  // Pair del/add for inline highlights
  hunks.forEach((h) => {
    for (let k = 0; k < h.lines.length; k++) {
      if (h.lines[k].type === "del") {
        let ds = k;
        while (k < h.lines.length && h.lines[k].type === "del") k++;
        const de = k;
        const as_ = k;
        while (k < h.lines.length && h.lines[k].type === "add") k++;
        const ae = k;
        const pairs = Math.min(de - ds, ae - as_);
        for (let p = 0; p < pairs; p++) {
          h.lines[ds + p].pair = h.lines[as_ + p];
          h.lines[as_ + p].pair = h.lines[ds + p];
        }
        k--;
      }
    }
  });

  let additions = 0,
    deletions = 0;
  allLines.forEach((l) => {
    if (l.type === "add") additions++;
    if (l.type === "del") deletions++;
  });
  return { hunks, additions, deletions };
}

export function computeInlineDiff(
  oldStr: string,
  newStr: string
): InlineDiffResult {
  if (oldStr === newStr)
    return {
      oldSegments: [{ text: oldStr, highlight: false }],
      newSegments: [{ text: newStr, highlight: false }],
    };
  const m = oldStr.length,
    n = newStr.length;
  if (m * n > 500000)
    return {
      oldSegments: [{ text: oldStr, highlight: true }],
      newSegments: [{ text: newStr, highlight: true }],
    };
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        oldStr[i - 1] === newStr[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const oldKeep = new Uint8Array(m),
    newKeep = new Uint8Array(n);
  let ci = m,
    cj = n;
  while (ci > 0 && cj > 0) {
    if (oldStr[ci - 1] === newStr[cj - 1]) {
      oldKeep[ci - 1] = 1;
      newKeep[cj - 1] = 1;
      ci--;
      cj--;
    } else if (dp[ci - 1][cj] >= dp[ci][cj - 1]) ci--;
    else cj--;
  }
  function buildSegments(str: string, keep: Uint8Array) {
    const segs: { text: string; highlight: boolean }[] = [];
    let k = 0;
    while (k < str.length) {
      const hl = !keep[k];
      let end = k;
      while (end < str.length && !keep[end] === hl) end++;
      segs.push({ text: str.slice(k, end), highlight: hl });
      k = end;
    }
    return segs;
  }
  return {
    oldSegments: buildSegments(oldStr, oldKeep),
    newSegments: buildSegments(newStr, newKeep),
  };
}
