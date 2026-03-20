import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Highlight from "@tiptap/extension-highlight";
import { useNotesStore } from "../../store/notesStore";
import { useAutoSave } from "../../hooks/useAutoSave";
import Toolbar from "./Toolbar";
import TagEditor from "./TagEditor";

export default function RichEditor({ onTextSelect }) {
  const { notes, activeNoteId, updateNote } = useNotesStore();
  const activeNote = notes.find((n) => n._id === activeNoteId);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [editorContent, setEditorContent] = useState("");

  const titleRef = useRef(null);
  const lastNoteIdRef = useRef(null);

  // ─── TipTap editor ──────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight.configure({ multicolor: false }),
    ],
    content: "",
    editorProps: {
      attributes: { class: "focus:outline-none", spellcheck: "true" },
    },
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        onTextSelect?.(editor.state.doc.textBetween(from, to, " "));
      } else {
        onTextSelect?.("");
      }
    },
  });

  // ─── Load note when switching ────────────────────────────────────
  useEffect(() => {
    if (!activeNote || !editor || editor.isDestroyed) return;
    if (lastNoteIdRef.current === activeNoteId) return;
    lastNoteIdRef.current = activeNoteId;

    const html = activeNote.content || "";
    setTitle(activeNote.title || "");
    setTags(activeNote.tags || []);
    setEditorContent(html);
    setTimeout(() => {
      if (!editor.isDestroyed) editor.commands.setContent(html, false);
    }, 0);
  }, [activeNoteId, activeNote, editor]);

  // ─── Auto-save ───────────────────────────────────────────────────
  useAutoSave(
    activeNoteId,
    { title, content: editorContent, tags },
    (id, data) => updateNote(id, data),
    !!activeNoteId
  );

  // ─── Keyboard shortcuts ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!editor || editor.isDestroyed) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "s") {
        e.preventDefault();
        if (activeNoteId) updateNote(activeNoteId, { title, content: editor.getHTML(), tags }, true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editor, title, tags, activeNoteId]);

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Select a note to start editing
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Toolbar editor={editor} note={activeNote} title={title} tags={tags} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowDown") {
                e.preventDefault();
                editor?.commands.focus("start");
              }
            }}
            placeholder="Note title…"
            className="w-full text-3xl font-display font-bold bg-transparent border-none outline-none text-text-primary placeholder-text-muted mb-3"
          />
          <TagEditor tags={tags} onChange={setTags} />
          <div className="h-px bg-space-700 mb-6" />
          <div className="tiptap-editor min-h-[400px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
