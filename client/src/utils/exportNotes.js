/**
 * Export Notes Utility - PDF and Markdown export
 */

/**
 * Export note as Markdown file
 */
export const exportAsMarkdown = (note) => {
  const tagsLine = note.tags?.length ? `\nTags: ${note.tags.join(", ")}\n` : "";
  const dateLine = `\nLast updated: ${new Date(note.updatedAt).toLocaleString()}\n`;

  // Convert HTML content to basic markdown
  const div = document.createElement("div");
  div.innerHTML = note.content || "";
  const textContent = div.innerText || div.textContent || "";

  const markdown = `# ${note.title}\n${dateLine}${tagsLine}\n---\n\n${textContent}`;

  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, "_")}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export note as HTML (print-ready)
 */
export const exportAsHTML = (note) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${note.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
    h1 { border-bottom: 2px solid #7c5cfc; padding-bottom: 10px; }
    .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
    .tags span { background: #f0ebff; color: #7c5cfc; padding: 2px 8px; border-radius: 20px; font-size: 0.8em; margin-right: 4px; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 4px; font-size: 0.9em; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f0ff; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  <div class="meta">
    <span>Created: ${new Date(note.createdAt).toLocaleString()}</span> · 
    <span>Updated: ${new Date(note.updatedAt).toLocaleString()}</span>
  </div>
  ${note.tags?.length ? `<div class="tags">${note.tags.map((t) => `<span>${t}</span>`).join("")}</div><br>` : ""}
  <div class="content">${note.content || ""}</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, "_")}.html`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Print note as PDF (uses browser print dialog)
 */
export const exportAsPDF = (note) => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${note.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
    h1 { border-bottom: 2px solid #7c5cfc; padding-bottom: 10px; color: #1a1a2e; }
    .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
    .tag { background: #f0ebff; color: #7c5cfc; padding: 2px 8px; border-radius: 20px; font-size: 0.8em; margin-right: 4px; display: inline-block; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; page-break-inside: avoid; }
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 4px; font-size: 0.9em; font-family: monospace; }
    table { border-collapse: collapse; width: 100%; page-break-inside: avoid; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f0ff; }
    blockquote { border-left: 4px solid #7c5cfc; margin-left: 0; padding-left: 16px; color: #666; }
    @media print { 
      body { margin: 0; } 
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  <div class="meta">
    Created: ${new Date(note.createdAt).toLocaleString()} · Updated: ${new Date(note.updatedAt).toLocaleString()}
  </div>
  ${note.tags?.length ? `<div style="margin-bottom:16px">${note.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
  <div>${note.content || ""}</div>
  <script>window.onload = () => { window.print(); window.close(); }<\/script>
</body>
</html>`);
  printWindow.document.close();
};
