function renderTable(block: string): string {
  const rows = block.trim().split("\n");
  if (rows.length < 2) return block;

  const parseRow = (row: string) =>
    row.split("|").slice(1, -1).map((c) => c.trim());

  const headers = parseRow(rows[0]);
  // Skip separator row (row[1])
  const bodyRows = rows.slice(2);

  let html = "<table><thead><tr>";
  for (const h of headers) {
    html += `<th>${h}</th>`;
  }
  html += "</tr></thead><tbody>";
  for (const row of bodyRows) {
    const cells = parseRow(row);
    html += "<tr>";
    for (const cell of cells) {
      html += `<td>${cell}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

export function renderMarkdown(content: string): string {
  // Extract tables first, replace with placeholders
  const tables: string[] = [];
  let out = content.replace(
    /((?:^\|.+\|$\n?){2,})/gm,
    (_match, tableBlock: string) => {
      tables.push(renderTable(tableBlock));
      return `\x00TABLE${tables.length - 1}\x00`;
    }
  );

  out = out
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Blockquotes
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
    // Bold + Italic
    .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Checkboxes
    .replace(/^- \[x\] (.+)$/gm, '<div class="md-check checked">$1</div>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="md-check">$1</div>')
    // Unordered list
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr/>")
    // Paragraphs (double newline)
    .replace(/\n\n/g, "</p><p>")
    // Single newlines within paragraphs
    .replace(/\n/g, "<br/>");

  // Wrap consecutive <li> in <ul>
  out = out.replace(/((?:<li>.*?<\/li>(?:<br\/>)?)+)/g, "<ul>$1</ul>");
  // Clean up br inside ul
  out = out.replace(/<ul>(.*?)<\/ul>/gs, (_m, inner: string) => "<ul>" + inner.replace(/<br\/>/g, "") + "</ul>");
  // Merge consecutive blockquotes
  out = out.replace(
    /<\/blockquote>(?:<br\/>|<\/p><p>)*<blockquote>/g,
    "<br/>"
  );

  // Restore tables
  tables.forEach((table, i) => {
    out = out.replace(`\x00TABLE${i}\x00`, table);
  });

  return "<p>" + out + "</p>";
}
