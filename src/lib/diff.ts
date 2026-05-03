import { diffChars, formatPatch, structuredPatch } from "diff";

const FILE_NAME = "doc.md";

export interface DiffResult {
  patch: string;
  additions: number;
  deletions: number;
}

export interface CharSegment {
  text: string;
  changed: boolean;
}

export interface PatchLine {
  raw: string;
  segments?: CharSegment[];
}

export const isAdd = (s: string) => s.startsWith("+") && !s.startsWith("+++");
export const isDel = (s: string) => s.startsWith("-") && !s.startsWith("---");

export function computeDiff(oldText: string, newText: string): DiffResult {
  const sp = structuredPatch(FILE_NAME, FILE_NAME, oldText, newText, "", "", {
    context: 3,
  });

  let additions = 0;
  let deletions = 0;
  for (const hunk of sp.hunks) {
    for (const line of hunk.lines) {
      if (line[0] === "+") additions++;
      else if (line[0] === "-") deletions++;
    }
  }

  return { patch: formatPatch(sp), additions, deletions };
}

export function parsePatch(patch: string): PatchLine[] {
  const lines: PatchLine[] = (
    patch ? patch.replace(/\n$/, "").split("\n") : []
  ).map((raw) => ({ raw }));

  let i = 0;
  while (i < lines.length) {
    if (!isDel(lines[i].raw)) {
      i++;
      continue;
    }
    let j = i;
    while (j < lines.length && isDel(lines[j].raw)) j++;
    const delEnd = j;
    while (j < lines.length && isAdd(lines[j].raw)) j++;
    const addEnd = j;
    const delCount = delEnd - i;
    const addCount = addEnd - delEnd;
    if (delCount > 0 && delCount === addCount) {
      for (let k = 0; k < delCount; k++) {
        const parts = diffChars(
          lines[i + k].raw.slice(1),
          lines[delEnd + k].raw.slice(1)
        );
        const oldSegs: CharSegment[] = [];
        const newSegs: CharSegment[] = [];
        for (const p of parts) {
          if (p.added) newSegs.push({ text: p.value, changed: true });
          else if (p.removed) oldSegs.push({ text: p.value, changed: true });
          else {
            oldSegs.push({ text: p.value, changed: false });
            newSegs.push({ text: p.value, changed: false });
          }
        }
        lines[i + k].segments = oldSegs;
        lines[delEnd + k].segments = newSegs;
      }
    }
    i = addEnd;
  }

  return lines;
}
