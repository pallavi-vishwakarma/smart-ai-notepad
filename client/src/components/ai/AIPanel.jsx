import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit, Lightbulb, GitBranch, Wrench, Sparkles,
  MousePointerClick, ChevronRight, Loader2, RotateCcw,
  FileText, List, AlertTriangle
} from "lucide-react";
import { useAI } from "../../hooks/useAI";
import { useNotesStore } from "../../store/notesStore";
import DiagramMode from "./DiagramMode";
import AIResult from "./AIResult";
import toast from "react-hot-toast";

const MODES = [
  { id: "explain",  label: "Explain",  icon: Lightbulb,  color: "text-accent-yellow", bg: "bg-accent-yellow/10", border: "border-accent-yellow/30", hint: "Explain in simple Hindi + English" },
  { id: "diagram",  label: "Diagram",  icon: GitBranch,  color: "text-accent-cyan",   bg: "bg-accent-cyan/10",   border: "border-accent-cyan/30",   hint: "Generate flowcharts & mindmaps" },
  { id: "solve",    label: "Solve",    icon: Wrench,     color: "text-accent-green",  bg: "bg-accent-green/10",  border: "border-accent-green/30",  hint: "Detect problems & step-by-step fix" },
  { id: "improve",  label: "Improve",  icon: Sparkles,   color: "text-accent-purple", bg: "bg-accent-purple/10", border: "border-accent-purple/30", hint: "Improve clarity & grammar" },
];

const QUICK_ACTIONS = [
  { id: "summarize",        label: "Summarize",     icon: FileText,      color: "text-accent-blue" },
  { id: "bullets",          label: "Bullet Points", icon: List,          color: "text-accent-cyan" },
  { id: "extract-problems", label: "Find Problems", icon: AlertTriangle, color: "text-accent-red" },
  { id: "suggest-solutions",label: "Solutions",     icon: Lightbulb,     color: "text-accent-green" },
];

const DIAGRAM_TYPES = ["flowchart", "mindmap", "sequence", "ascii"];

export default function AIPanel({ selectedText }) {
  const { loading, result, mode, setMode, error, run, clear } = useAI();
  const { notes, activeNoteId } = useNotesStore();
  const activeNote = notes.find((n) => n._id === activeNoteId);

  const [textSource, setTextSource] = useState("selected");
  const [diagramType, setDiagramType] = useState("flowchart");
  const [customText, setCustomText] = useState("");

  const activeMode = MODES.find((m) => m.id === mode);
  const ModeIcon = activeMode?.icon || Sparkles;

  const getInputText = () => {
    if (textSource === "custom" && customText.trim()) return customText;
    if (textSource === "selected" && selectedText?.trim()) return selectedText;
    // full note
    const div = document.createElement("div");
    div.innerHTML = activeNote?.content || "";
    return (div.innerText || "").trim();
  };

  const handleRun = async () => {
    const text = getInputText();
    if (!text) {
      toast.error(textSource === "selected" ? "Select text in the editor first" : "Note is empty");
      return;
    }
    await run(text, mode, { diagramType });
  };

  const handleQuickAction = async (actionId) => {
    const text = getInputText();
    if (!text) { toast.error("No content to process"); return; }
    await run(text, actionId);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-space-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
            <BrainCircuit size={14} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">AI Assistant</h2>
            <p className="text-[10px] text-text-muted">GPT-4o-mini powered</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Mode selector */}
        <div className="p-3 border-b border-space-700">
          <p className="text-[10px] text-text-muted uppercase tracking-wide font-semibold mb-2">Mode</p>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); clear(); }}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${
                    mode === m.id
                      ? `${m.bg} ${m.border} ${m.color}`
                      : "bg-space-800 border-space-600 text-text-muted hover:border-space-500 hover:text-text-secondary"
                  }`}
                >
                  <Icon size={13} className="flex-shrink-0" />
                  <span className="text-xs font-medium">{m.label}</span>
                </button>
              );
            })}
          </div>
          {activeMode && (
            <p className="text-[10px] text-text-muted mt-1.5 pl-0.5">{activeMode.hint}</p>
          )}
        </div>

        {/* Diagram type (only in diagram mode) */}
        {mode === "diagram" && (
          <div className="px-3 py-2 border-b border-space-700">
            <p className="text-[10px] text-text-muted uppercase tracking-wide font-semibold mb-2">Diagram Type</p>
            <div className="grid grid-cols-2 gap-1">
              {DIAGRAM_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setDiagramType(type)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                    diagramType === type
                      ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan"
                      : "bg-space-800 border-space-600 text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text source */}
        <div className="px-3 py-2 border-b border-space-700">
          <p className="text-[10px] text-text-muted uppercase tracking-wide font-semibold mb-2">Input</p>
          <div className="flex gap-1">
            {[
              { id: "selected", label: "Selection" },
              { id: "full",     label: "Full note" },
              { id: "custom",   label: "Custom" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setTextSource(s.id)}
                className={`flex-1 py-1 px-1 rounded-lg text-[11px] border transition-all ${
                  textSource === s.id
                    ? "bg-accent-purple/10 border-accent-purple/30 text-accent-purple"
                    : "bg-space-800 border-space-600 text-text-muted hover:text-text-secondary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {textSource === "selected" && (
            <div className="mt-2">
              {selectedText?.trim() ? (
                <div className="bg-space-800 border border-space-600 rounded-lg p-2 text-[11px] text-text-secondary line-clamp-3 leading-relaxed italic">
                  "{selectedText.substring(0, 120)}{selectedText.length > 120 ? "…" : ""}"
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-1">
                  <MousePointerClick size={11} />
                  <span>Select text in the editor</span>
                </div>
              )}
            </div>
          )}

          {textSource === "custom" && (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste text here…"
              rows={4}
              className="mt-2 w-full bg-space-800 border border-space-600 rounded-xl p-2.5 text-xs text-text-primary placeholder-text-muted focus:border-accent-purple/50 focus:outline-none resize-none transition-colors"
            />
          )}
        </div>

        {/* Run button */}
        <div className="p-3 border-b border-space-700">
          <button
            onClick={handleRun}
            disabled={loading}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              loading
                ? "bg-space-700 text-text-muted cursor-not-allowed"
                : "bg-gradient-to-r from-accent-purple to-accent-blue text-white hover:opacity-90 active:scale-[0.99] glow-purple"
            }`}
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Processing…</>
            ) : (
              <><ModeIcon size={15} /> Run {activeMode?.label} <ChevronRight size={13} /></>
            )}
          </button>
        </div>

        {/* Quick actions */}
        <div className="p-3 border-b border-space-700">
          <p className="text-[10px] text-text-muted uppercase tracking-wide font-semibold mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  disabled={loading}
                  className="flex items-center gap-2 p-2 rounded-xl bg-space-800 border border-space-600 hover:border-space-500 text-text-muted hover:text-text-secondary transition-all disabled:opacity-40 text-left"
                >
                  <Icon size={12} className={`flex-shrink-0 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {(result || error) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-text-muted uppercase tracking-wide font-semibold">Result</p>
                <button
                  onClick={clear}
                  className="p-1 rounded-md hover:bg-space-700 text-text-muted hover:text-text-secondary transition-colors"
                  title="Clear result"
                >
                  <RotateCcw size={11} />
                </button>
              </div>

              {error ? (
                <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-3 text-xs text-accent-red">
                  {error}
                </div>
              ) : mode === "diagram" ? (
                <DiagramMode result={result} />
              ) : (
                <AIResult result={result} mode={mode} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !error && !loading && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-space-800 border border-space-600 flex items-center justify-center mx-auto mb-3">
              <BrainCircuit size={22} className="text-text-muted" />
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Select a mode, pick your input, and click Run.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
