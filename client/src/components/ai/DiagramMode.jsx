import React, { useEffect, useRef, useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function DiagramMode({ result }) {
  const mermaidRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [renderError, setRenderError] = useState(null);

  // Extract mermaid code from markdown code block
  const extractMermaid = (text) => {
    const match = text?.match(/```mermaid\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  const isAscii = (text) => !text?.includes("```mermaid");
  const mermaidCode = extractMermaid(result);
  const isAsciiDiagram = isAscii(result);

  useEffect(() => {
    if (!mermaidCode || !mermaidRef.current) return;

    const renderMermaid = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#7c5cfc",
            primaryTextColor: "#e8e8f0",
            primaryBorderColor: "#5c5c7a",
            lineColor: "#5c8dfc",
            sectionBkgColor: "#1a1a2e",
            altSectionBkgColor: "#161625",
            tertiaryColor: "#252545",
            background: "#0d0d1a",
            edgeLabelBackground: "#1a1a2e",
            fontFamily: "'Outfit', sans-serif",
          },
          flowchart: { htmlLabels: true, curve: "basis" },
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
          setRendered(true);
          setRenderError(null);
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        setRenderError("Could not render diagram. Showing raw code.");
        setRendered(false);
      }
    };

    renderMermaid();
  }, [mermaidCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode || result || "");
    setCopied(true);
    toast.success("Diagram code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    if (!mermaidRef.current) return;
    const svg = mermaidRef.current.innerHTML;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!result) return null;

  return (
    <div className="bg-space-800 border border-space-600 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-space-700">
        <span className="text-[10px] text-text-muted font-medium">
          {isAsciiDiagram ? "ASCII Diagram" : "Mermaid Diagram"}
        </span>
        <div className="flex items-center gap-1">
          {rendered && (
            <button
              onClick={handleDownloadSVG}
              className="p-1 rounded-md hover:bg-space-700 text-text-muted hover:text-text-secondary transition-colors"
              title="Download SVG"
            >
              <Download size={12} />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-space-700 text-text-muted hover:text-text-secondary transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={12} className="text-accent-green" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Diagram render area */}
      <div className="p-3">
        {isAsciiDiagram ? (
          // ASCII diagram
          <pre className="font-mono text-xs text-accent-cyan leading-relaxed overflow-x-auto whitespace-pre bg-space-900 rounded-lg p-3 border border-space-700">
            {result}
          </pre>
        ) : mermaidCode ? (
          <>
            {/* Mermaid rendered SVG */}
            <div
              ref={mermaidRef}
              className="mermaid-container p-3 rounded-lg overflow-auto"
              style={{ minHeight: "100px" }}
            />
            {renderError && (
              <div className="mt-2">
                <p className="text-xs text-accent-yellow mb-2">{renderError}</p>
                <pre className="font-mono text-xs text-text-secondary leading-relaxed overflow-x-auto whitespace-pre bg-space-900 rounded-lg p-3 border border-space-700">
                  {mermaidCode}
                </pre>
              </div>
            )}
            {/* Always show raw code below */}
            {rendered && (
              <details className="mt-2">
                <summary className="text-[10px] text-text-muted cursor-pointer hover:text-text-secondary">
                  View Mermaid source
                </summary>
                <pre className="mt-1 font-mono text-xs text-text-secondary leading-relaxed overflow-x-auto whitespace-pre bg-space-900 rounded-lg p-3 border border-space-700">
                  {mermaidCode}
                </pre>
              </details>
            )}
          </>
        ) : (
          // Fallback: raw text
          <pre className="font-mono text-xs text-text-secondary leading-relaxed overflow-x-auto whitespace-pre">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
