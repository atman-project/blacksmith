export function renderMarkdown(content: string): string {
  let out = content
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

  return "<p>" + out + "</p>";
}
