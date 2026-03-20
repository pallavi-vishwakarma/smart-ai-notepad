import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Pin, Trash2, GripVertical } from "lucide-react";
import { useNotesStore } from "../../store/notesStore";
import { formatDistanceToNow } from "date-fns";

export default function NotesList() {
  const store = useNotesStore();
  const {
    notes, activeNoteId, searchQuery, activeTag, tags,
    createNote, selectNote, deleteNote, reorderNotes,
    setSearchQuery, setActiveTag,
  } = store;

  const [dragIndex, setDragIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const dragOverRef = useRef(null);

  // Client-side filter
  const q = searchQuery.toLowerCase();
  const filtered = notes.filter((n) => {
    const matchSearch =
      !q ||
      n.title?.toLowerCase().includes(q) ||
      n.preview?.toLowerCase().includes(q) ||
      n.tags?.some((t) => t.toLowerCase().includes(q));
    const matchTag = !activeTag || n.tags?.includes(activeTag);
    return matchSearch && matchTag;
  });

  // Drag-and-drop
  const handleDragStart = (e, i) => { setDragIndex(i); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e, i) => { e.preventDefault(); dragOverRef.current = i; setHoverIndex(i); };
  const handleDrop = () => {
    if (dragIndex === null || dragOverRef.current === null || dragIndex === dragOverRef.current) {
      setDragIndex(null); setHoverIndex(null); return;
    }
    const arr = [...filtered];
    const [moved] = arr.splice(dragIndex, 1);
    arr.splice(dragOverRef.current, 0, moved);
    reorderNotes(arr.map((n) => n._id));
    setDragIndex(null); setHoverIndex(null); dragOverRef.current = null;
  };
  const handleDragEnd = () => { setDragIndex(null); setHoverIndex(null); };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-space-700 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">
            Notes
            <span className="ml-1.5 text-[11px] font-normal text-text-muted bg-space-700 px-1.5 py-0.5 rounded-full">
              {notes.length}
            </span>
          </h2>
          <button
            onClick={createNote}
            className="flex items-center gap-1 bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple border border-accent-purple/30 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
          >
            <Plus size={12} /> New
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes…"
            className="w-full bg-space-800 border border-space-600 rounded-lg py-1.5 pl-7 pr-7 text-xs text-text-primary placeholder-text-muted focus:border-accent-purple/50 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="px-3 py-2 border-b border-space-700 flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
              !activeTag ? "bg-accent-purple/20 text-accent-purple border-accent-purple/30" : "text-text-muted bg-space-800 border-space-600 hover:text-text-secondary"
            }`}
          >All</button>
          {tags.slice(0, 10).map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                activeTag === tag ? "bg-accent-purple/20 text-accent-purple border-accent-purple/30" : "text-text-muted bg-space-800 border-space-600 hover:text-text-secondary"
              }`}
            >#{tag}</button>
          ))}
        </div>
      )}

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {filtered.length === 0 ? (
          <p className="text-center text-text-muted text-xs py-10">
            {searchQuery || activeTag ? "No matching notes" : "No notes yet"}
          </p>
        ) : (
          filtered.map((note, index) => (
            <NoteItem
              key={note._id}
              note={note}
              isActive={note._id === activeNoteId}
              isDragging={dragIndex === index}
              isDropTarget={hoverIndex === index && dragIndex !== index}
              onSelect={() => selectNote(note._id)}
              onDelete={(e) => { e.stopPropagation(); deleteNote(note._id); }}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NoteItem({ note, isActive, isDragging, isDropTarget, onSelect, onDelete, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const [hovered, setHovered] = useState(false);

  let timeAgo = "";
  try { timeAgo = note.updatedAt ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) : ""; } catch {}

  return (
    <div
      draggable
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative mx-2 mb-1 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150 border ${
        isActive
          ? "bg-accent-purple/10 border-accent-purple/30"
          : isDropTarget
          ? "bg-space-700 border-accent-purple/20"
          : isDragging
          ? "opacity-30 border-space-600"
          : "bg-transparent border-transparent hover:bg-space-800 hover:border-space-600"
      }`}
    >
      {/* Active indicator bar */}
      {isActive && <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-accent-purple rounded-full" />}

      <div className="flex items-start gap-1.5">
        {/* Drag handle */}
        <div className={`mt-0.5 transition-opacity flex-shrink-0 ${hovered ? "opacity-30" : "opacity-0"} cursor-grab`}>
          <GripVertical size={11} className="text-text-muted" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-1 mb-0.5">
            {note.isPinned && <Pin size={9} className="text-accent-yellow flex-shrink-0" />}
            <p className={`text-sm font-medium truncate ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
              {note.title || "Untitled"}
            </p>
          </div>

          {/* Preview */}
          {note.preview && (
            <p className="text-[11px] text-text-muted truncate mb-1 leading-relaxed">
              {note.preview}
            </p>
          )}

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-1">
              {note.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] bg-space-700 text-text-muted px-1.5 py-px rounded-full">
                  #{tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-[10px] text-text-muted">+{note.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Time */}
          <p className="text-[10px] text-text-muted">{timeAgo}</p>
        </div>

        {/* Delete button */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.1 }}
              onClick={onDelete}
              className="p-1 rounded-md hover:bg-accent-red/20 hover:text-accent-red text-text-muted transition-colors flex-shrink-0 mt-0.5"
            >
              <Trash2 size={11} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
