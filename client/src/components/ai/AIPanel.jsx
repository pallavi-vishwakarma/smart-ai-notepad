import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Lightbulb, GitBranch, Wrench,
  RotateCcw, MousePointerClick, FileText, List,
  AlertTriangle, Loader2, Copy, Check
} from "lucide-react";
import { useAI } from "../../hooks/useAI";
import { useNotesStore } from "../../store/notesStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DiagramMode from "./DiagramMode";
import toast from "react-hot-toast";

const QUICK_ACTIONS = [
  { id: "summarize",         label: "Summarize",     icon: FileText  },
  { id: "improve",           label: "Fix Structure", icon: Sparkles  },
  { id: "bullets",           label: "Suggest Headings", icon: List   },
  { id: "extract-problems",  label: "Find Issues",   icon: AlertTriangle },
];

const MODE_PROMPTS = [
  { id: "explain", label: "Explain", icon: Lightbulb,  color: "#fcdc5c" },
  { id: "diagram", label: "Diagram", icon: GitBranch,  color: "#F375C2" },
  { id: "solve",   label: "Solve",   icon: Wrench,     color: "#5cfca0" },
  { id: "improve", label: "Improve", icon: Sparkles,   color: "#B153D7" },
];

export default function AIPanel({ selectedText }) {
  const { loading, result, mode, setMode, error, run, clear } = useAI();
  const { notes, activeNoteId } = useNotesStore();
  const activeNote = notes.find((n) => n._id === activeNoteId);

  const [messages, setMessages]     = useState([]);
  const [inputText, setInputText]   = useState("");
  const [diagramType, setDiagramType] = useState("flowchart");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getNoteText = () => {
    const div = document.createElement("div");
    div.innerHTML = activeNote?.content || "";
    return (div.innerText || "").trim();
  };

  const handleSend = async (textOverride, modeOverride) => {
    const text = textOverride || inputText || selectedText || getNoteText();
    const useMode = modeOverride || mode;

    if (!text?.trim()) {
      toast.error("Select text or write something first");
      return;
    }

    const userMsg = { role: "user", text: textOverride || inputText || "Analyze my note", time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    const res = await run(text, useMode, { diagramType });

    if (res) {
      setMessages((prev) => [...prev, {
        role: "ai",
        text: res,
        mode: useMode,
        time: new Date(),
        isDiagram: useMode === "diagram",
      }]);
    }
  };

  const handleQuickAction = (actionId) => {
    const text = selectedText || getNoteText();
    handleSend(text || "Analyze this", actionId);
  };

  return (
    <div className="flex flex-col h-full bg-space-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-space-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #B153D7, #F375C2)" }}>
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-text-primary">AI Mind</h2>
            <p className="text-[10px] text-text-muted">Pro Plan</p>
          </div>
        </div>
        <button onClick={() => { clear(); setMessages([]); }} className="p-1.5 rounded-lg hover:bg-space-700 text-text-muted hover:text-text-secondary transition-colors" title="Clear chat">
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Mode selector */}
      <div className="px-3 py-2 border-b border-space-700 flex gap-1.5 flex-shrink-0">
        {MODE_PROMPTS.map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-medium transition-all ${
                mode === m.id ? "border-opacity-50 text-white" : "bg-space-800 border-space-700 text-text-muted hover:text-text-secondary"
              }`}
              style={mode === m.id ? { background: `${m.color}22`, borderColor: `${m.color}55`, color: m.color } : {}}
            >
              <Icon size={13} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* Welcome */}
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(177,83,215,0.2), rgba(243,117,194,0.15))", border: "1px solid rgba(177,83,215,0.2)" }}>
              <Sparkles size={24} style={{ color: "#B153D7" }} />
            </div>
            <p className="text-sm font-semibold text-text-primary mb-1">AI Mind</p>
            <p className="text-xs text-text-muted leading-relaxed px-4">
              Select text in your note or ask me anything about your content.
            </p>

            {/* Selected text preview */}
            {selectedText && (
              <div className="mt-3 mx-2 p-2.5 rounded-xl text-left" style={{ background: "rgba(177,83,215,0.08)", border: "1px solid rgba(177,83,215,0.2)" }}>
                <p className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
                  <MousePointerClick size={9} /> Selected text
                </p>
                <p className="text-xs text-text-secondary italic line-clamp-2">"{selectedText.substring(0, 100)}"</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Message list */}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-6 h-6 rounded-lg mr-2 mt-1 flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #B153D7, #F375C2)" }}>
                  <Sparkles size={11} className="text-white" />
                </div>
              )}
              <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
                {msg.role === "user" ? (
                  <div className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs text-text-secondary" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {msg.text}
                  </div>
                ) : (
                  <div className="rounded-2xl rounded-tl-sm overflow-hidden" style={{ background: "rgba(22,22,37,0.8)", border: "1px solid rgba(177,83,215,0.15)" }}>
                    {msg.isDiagram ? (
                      <div className="p-3">
                        <DiagramMode result={msg.text} />
                      </div>
                    ) : (
                      <div className="p-3">
                        <div className="ai-markdown">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    <CopyBar text={msg.text} />
                  </div>
                )}
                <p className="text-[9px] text-text-muted mt-1 px-1">
                  {msg.time?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="w-6 h-6 rounded-lg mr-2 flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #B153D7, #F375C2)" }}>
              <Sparkles size={11} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2" style={{ background: "rgba(22,22,37,0.8)", border: "1px solid rgba(177,83,215,0.15)" }}>
              <Loader2 size={13} className="animate-spin" style={{ color: "#B153D7" }} />
              <span className="text-xs text-text-muted">Thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div className="px-3 py-2 border-t border-space-700 flex gap-1.5 overflow-x-auto flex-shrink-0">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.id} onClick={() => handleQuickAction(action.id)} disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-text-muted hover:text-text-secondary whitespace-nowrap transition-all disabled:opacity-40 flex-shrink-0"
              style={{ background: "rgba(177,83,215,0.08)", border: "1px solid rgba(177,83,215,0.15)" }}
            >
              <Icon size={11} style={{ color: "#B153D7" }} />
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-space-700 flex-shrink-0">
        {/* Diagram type selector */}
        {mode === "diagram" && (
          <div className="flex gap-1 mb-2">
            {["flowchart", "mindmap", "sequence", "ascii"].map((t) => (
              <button key={t} onClick={() => setDiagramType(t)}
                className={`flex-1 py-1 rounded-lg text-[10px] border transition-all capitalize ${
                  diagramType === t ? "text-white" : "bg-space-800 border-space-700 text-text-muted"
                }`}
                style={diagramType === t ? { background: "rgba(243,117,194,0.2)", borderColor: "rgba(243,117,194,0.4)", color: "#F375C2" } : {}}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask AI about your notes..."
              rows={1}
              className="w-full bg-space-800 border border-space-600 rounded-2xl py-2.5 px-3.5 text-xs text-text-primary placeholder-text-muted focus:border-accent-purple/50 focus:outline-none resize-none transition-all"
              style={{ minHeight: "38px", maxHeight: "100px" }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #B153D7, #F375C2)", boxShadow: "0 4px 16px rgba(177,83,215,0.3)" }}
          >
            {loading ? <Loader2 size={14} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyBar({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="px-3 pb-2 flex justify-end">
      <button onClick={copy} className="flex items-center gap-1 text-[10px] text-text-muted hover:text-text-secondary transition-colors">
        {copied ? <><Check size={10} className="text-green-400" /> Copied</> : <><Copy size={10} /> Copy</>}
      </button>
    </div>
  );
}