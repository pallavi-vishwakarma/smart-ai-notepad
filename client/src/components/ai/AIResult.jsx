import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function AIResult({ result, mode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result || "");
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!result) return null;

  return (
    <div className="bg-space-800 border border-space-600 rounded-xl overflow-hidden">
      {/* Copy header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-space-700">
        <span className="text-[10px] text-text-muted font-medium capitalize">{mode} result</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded-md hover:bg-space-700 text-text-muted hover:text-text-secondary transition-colors"
          title="Copy result"
        >
          {copied ? <Check size={12} className="text-accent-green" /> : <Copy size={12} />}
        </button>
      </div>

      {/* Markdown content */}
      <div className="p-3 max-h-[500px] overflow-y-auto">
        <div className="ai-markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                return inline ? (
                  <code className={className} {...props}>{children}</code>
                ) : (
                  <pre><code className={className} {...props}>{children}</code></pre>
                );
              },
            }}
          >
            {result}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
