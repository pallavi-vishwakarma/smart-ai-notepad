import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold, Italic, Underline, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3, List, ListOrdered,
  CheckSquare, Table, Quote, Undo, Redo, Highlighter,
  Download, History, MoreHorizontal, Minus,
  Sparkles, AlignLeft, Zap
} from "lucide-react";
import { exportAsMarkdown, exportAsPDF, exportAsHTML } from "../../utils/exportNotes";
import { useNotesStore } from "../../store/notesStore";
import { aiApi } from "../../api/aiApi";
import toast from "react-hot-toast";

const ToolbarBtn = ({ onClick, active, disabled, title, children }) => (
  <button
    onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md text-sm transition-all ${
      active
        ? "bg-accent-purple/20 text-accent-purple"
        : "text-text-muted hover:text-text-primary hover:bg-space-700"
    } disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-space-600 mx-0.5 flex-shrink-0" />;

export default function Toolbar({ editor, note, title, tags }) {
  const { updateNote, activeNoteId } = useNotesStore();
  const [showExport, setShowExport] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [aiLoading, setAiLoading] = useState(null);

  if (!editor) return null;

  // ─── AI smart actions on full note content ──────────────────────
  const runAIAction = async (action) => {
    const text = editor.getText();
    if (!text.trim()) return toast.error("Note is empty");
    setAiLoading(action);
    try {
      let result;
      switch (action) {
        case "summarize":
          result = await aiApi.summarize(text);
          editor.chain().focus().setContent(
            `<h2>Summary</h2><p>${result.result.replace(/\n/g, "<br/>")}</p><hr/>${editor.getHTML()}`,
            false
          ).run();
          toast.success("Summary added to top of note");
          break;
        case "bullets":
          result = await aiApi.bullets(text);
          editor.chain().focus()
            .selectAll()
            .setContent(result.result.replace(/\n/g, "<br/>"))
            .run();
          toast.success("Converted to bullet points");
          break;
        case "improve":
          result = await aiApi.improve(text);
          toast.success("Check the AI panel for improvements →");
          break;
        default: break;
      }
    } catch (err) {
      toast.error(err.message || "AI action failed");
    } finally {
      setAiLoading(null);
    }
  };

  // ─── Table insert ────────────────────────────────────────────────
  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  // ─── Load version history ────────────────────────────────────────
  const loadVersions = async () => {
    if (!activeNoteId) return;
    try {
      const { notesApi } = await import("../../api/notesApi");
      const { versions: v } = await notesApi.getNoteVersions(activeNoteId);
      setVersions(v);
      setShowVersions(true);
    } catch {
      toast.error("Could not load versions");
    }
  };

  const restoreVersion = (v) => {
    editor.commands.setContent(v.content || "", false);
    toast.success("Version restored");
    setShowVersions(false);
  };

  return (
    <div className="border-b border-space-700 bg-space-900 px-3 py-1.5 flex items-center gap-0.5 flex-wrap relative flex-shrink-0">
      {/* ─── Text formatting ──────────────────────────────────────── */}
      <ToolbarBtn title="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        <Bold size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <Italic size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
        <Underline size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
        <Strikethrough size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")}>
        <Highlighter size={14} />
      </ToolbarBtn>

      <Divider />

      {/* ─── Headings ─────────────────────────────────────────────── */}
      <ToolbarBtn title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
        <Heading1 size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
        <Heading2 size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
        <Heading3 size={14} />
      </ToolbarBtn>

      <Divider />

      {/* ─── Lists ────────────────────────────────────────────────── */}
      <ToolbarBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        <List size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        <ListOrdered size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Task list" onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")}>
        <CheckSquare size={14} />
      </ToolbarBtn>

      <Divider />

      {/* ─── Blocks ───────────────────────────────────────────────── */}
      <ToolbarBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
        <Quote size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Inline code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>
        <Code size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>
        <Code2 size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Insert table" onClick={insertTable}>
        <Table size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={14} />
      </ToolbarBtn>

      <Divider />

      {/* ─── Undo / Redo ──────────────────────────────────────────── */}
      <ToolbarBtn title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo size={14} />
      </ToolbarBtn>
      <ToolbarBtn title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo size={14} />
      </ToolbarBtn>

      <div className="flex-1" />

      {/* ─── AI Smart Actions ─────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 border-l border-space-600 pl-2 ml-1">
        <button
          onClick={() => runAIAction("summarize")}
          disabled={!!aiLoading}
          title="AI: Summarize note"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-accent-cyan hover:bg-accent-cyan/10 border border-transparent hover:border-accent-cyan/20 transition-all disabled:opacity-40"
        >
          {aiLoading === "summarize" ? (
            <div className="w-3 h-3 border border-accent-cyan/40 border-t-accent-cyan rounded-full animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
          <span className="hidden lg:inline">Summarize</span>
        </button>
        <button
          onClick={() => runAIAction("bullets")}
          disabled={!!aiLoading}
          title="AI: Convert to bullets"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-accent-purple hover:bg-accent-purple/10 border border-transparent hover:border-accent-purple/20 transition-all disabled:opacity-40"
        >
          {aiLoading === "bullets" ? (
            <div className="w-3 h-3 border border-accent-purple/40 border-t-accent-purple rounded-full animate-spin" />
          ) : (
            <Zap size={12} />
          )}
          <span className="hidden lg:inline">Bullets</span>
        </button>
      </div>

      {/* ─── More actions ─────────────────────────────────────────── */}
      <div className="relative ml-1">
        <button
          onClick={() => setShowExport((s) => !s)}
          title="More actions"
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-space-700 transition-colors"
        >
          <MoreHorizontal size={14} />
        </button>

        <AnimatePresence>
          {showExport && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute right-0 top-full mt-1 w-44 bg-space-800 border border-space-600 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-1">
                <p className="text-[10px] text-text-muted px-2 py-1 font-semibold uppercase tracking-wide">Export</p>
                <button onClick={() => { exportAsPDF({ ...note, title, tags }); setShowExport(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-space-700 hover:text-text-primary rounded-lg transition-colors flex items-center gap-2">
                  <Download size={12} /> Export as PDF
                </button>
                <button onClick={() => { exportAsMarkdown({ ...note, title, tags }); setShowExport(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-space-700 hover:text-text-primary rounded-lg transition-colors flex items-center gap-2">
                  <AlignLeft size={12} /> Export as Markdown
                </button>
                <button onClick={() => { exportAsHTML({ ...note, title, tags }); setShowExport(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-space-700 hover:text-text-primary rounded-lg transition-colors flex items-center gap-2">
                  <Code size={12} /> Export as HTML
                </button>
                <div className="h-px bg-space-700 my-1" />
                <button onClick={() => { loadVersions(); setShowExport(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-space-700 hover:text-text-primary rounded-lg transition-colors flex items-center gap-2">
                  <History size={12} /> Version History
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showExport && <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />}

      {/* ─── Version History Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showVersions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVersions(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-space-800 border border-space-600 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                <History size={16} className="text-accent-purple" /> Version History
              </h3>
              {versions.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-8">No versions saved yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {versions.map((v, i) => (
                    <div key={i} className="flex items-center justify-between bg-space-900 rounded-xl px-4 py-3 border border-space-600">
                      <div>
                        <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">{v.title || "Untitled"}</p>
                        <p className="text-xs text-text-muted">
                          {new Date(v.savedAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => restoreVersion(v)}
                        className="text-xs bg-accent-purple/20 text-accent-purple border border-accent-purple/30 px-3 py-1 rounded-lg hover:bg-accent-purple/30 transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowVersions(false)}
                className="mt-4 w-full py-2 rounded-xl bg-space-700 text-sm text-text-secondary hover:bg-space-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
