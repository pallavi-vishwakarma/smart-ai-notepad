import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Pin, Trash2, GripVertical, Folder, Clock, Hash } from "lucide-react";
import { useNotesStore } from "../../store/notesStore";
import { formatDistanceToNow } from "date-fns";

export default function NotesList() {
  const { notes, activeNoteId, searchQuery, activeTag, tags, createNote, selectNote, deleteNote, reorderNotes, setSearchQuery, setActiveTag } = useNotesStore();
  const [dragIndex, setDragIndex]   = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const dragOverRef = useRef(null);

  const q = searchQuery.toLowerCase();
  const filtered = notes.filter((n) => {
    const matchSearch = !q || n.title?.toLowerCase().includes(q) || n.preview?.toLowerCase().includes(q) || n.tags?.some((t) => t.toLowerCase().includes(q));
    const matchTag = !activeTag || n.tags?.includes(activeTag);
    return matchSearch && matchTag;
  });

  const pinned   = filtered.filter((n) => n.isPinned);
  const unpinned = filtered.filter((n) => !n.isPinned);

  const handleDragStart = (e, i) => { setDragIndex(i); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver  = (e, i) => { e.preventDefault(); dragOverRef.current = i; setHoverIndex(i); };
  const handleDrop = () => {
    if (dragIndex === null || dragOverRef.current === null) { setDragIndex(null); setHoverIndex(null); return; }
    const arr = [...filtered];
    const [moved] = arr.splice(dragIndex, 1);
    arr.splice(dragOverRef.current, 0, moved);
    reorderNotes(arr.map((n) => n._id));
    setDragIndex(null); setHoverIndex(null); dragOverRef.current = null;
  };

  return (
    <div className="flex flex-col h-full bg-space-900">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-display font-bold text-gradient">Library</h1>
          <button onClick={createNote} className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5">
            <Plus size={12} /> New
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your thoughts..."
            className="w-full bg-space-800 border border-space-600 rounded-xl py-2 pl-9 pr-8 text-xs text-text-primary placeholder-text-muted focus:border-accent-purple/50 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
          <button onClick={() => setActiveTag(null)} className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${!activeTag ? "bg-accent-purple/20 text-accent-purple border-accent-purple/30" : "text-text-muted bg-space-800 border-space-700 hover:text-text-secondary"}`}>
            All
          </button>
          {tags.slice(0, 8).map((tag) => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${activeTag === tag ? "bg-accent-purple/20 text-accent-purple border-accent-purple/30" : "text-text-muted bg-space-800 border-space-700 hover:text-text-secondary"}`}>
              <Hash size={9} />{tag}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {/* Pinned Notes — Bento Grid */}
        {pinned.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold px-1 mb-2 flex items-center gap-1.5">
              <Pin size={9} /> Pinned Notes <span className="text-accent-purple">{pinned.length} items</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {pinned.map((note) => (
                <BentoCard key={note._id} note={note} isActive={note._id === activeNoteId} onSelect={() => selectNote(note._id)} onDelete={() => deleteNote(note._id)} />
              ))}
            </div>
          </div>
        )}

        {/* Folders section */}
        <div className="mb-4">
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold px-1 mb-2 flex items-center gap-1.5">
            <Folder size={9} /> Folders
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-space-800 border border-space-700 hover:border-accent-purple/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                  <Folder size={11} className="text-accent-purple" />
                </div>
                <span className="text-xs text-text-secondary">All Notes</span>
              </div>
              <span className="text-[10px] text-text-muted">{notes.length}</span>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold px-1 mb-2 flex items-center gap-1.5">
            <Clock size={9} /> Recent Notes
          </p>
          <div className="space-y-1">
            <AnimatePresence>
              {unpinned.length === 0 ? (
                <p className="text-center text-text-muted text-xs py-8">
                  {searchQuery ? "No results found" : "No notes yet"}
                </p>
              ) : (
                unpinned.map((note, index) => (
                  <NoteItem
                    key={note._id}
                    note={note}
                    isActive={note._id === activeNoteId}
                    isDragging={dragIndex === index}
                    isDropTarget={hoverIndex === index && dragIndex !== index}
                    onSelect={() => selectNote(note._id)}
                    onDelete={() => deleteNote(note._id)}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={handleDrop}
                    onDragEnd={() => { setDragIndex(null); setHoverIndex(null); }}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bento Card for pinned notes
function BentoCard({ note, isActive, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative p-3 rounded-2xl cursor-pointer transition-all border ${
        isActive ? "note-item-active border-accent-purple/40" : "bg-space-800 border-space-600 hover:border-accent-purple/25"
      }`}
    >
      <div className="w-8 h-8 rounded-xl mb-2 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(177,83,215,0.3), rgba(243,117,194,0.2))" }}>
        <span className="text-lg">📌</span>
      </div>
      <p className="text-xs font-semibold text-text-primary truncate mb-1">{note.title || "Untitled"}</p>
      <p className="text-[10px] text-text-muted line-clamp-2 leading-relaxed">{note.preview || "No content"}</p>
      {note.tags?.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {note.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(177,83,215,0.15)", color: "#e8aaff" }}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute top-2 right-2 p-1 rounded-lg bg-space-700 hover:bg-red-500/20 hover:text-red-400 text-text-muted transition-colors"
          >
            <Trash2 size={10} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Regular note list item
function NoteItem({ note, isActive, isDragging, isDropTarget, onSelect, onDelete, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const [hovered, setHovered] = useState(false);
  let timeAgo = "";
  try { timeAgo = note.updatedAt ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) : ""; } catch {}

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      draggable
      onClick={onSelect}
      onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={`relative flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all border mb-1 ${
        isActive ? "note-item-active border-accent-purple/40" :
        isDropTarget ? "bg-space-700 border-accent-purple/20" :
        isDragging ? "opacity-30 border-space-600" :
        "bg-transparent border-transparent hover:bg-space-800 hover:border-space-700"
      }`}
    >
      {isActive && <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: "linear-gradient(to bottom, #B153D7, #F375C2)" }} />}

      <div className={`mt-0.5 transition-opacity flex-shrink-0 ${hovered ? "opacity-40" : "opacity-0"} cursor-grab`}>
        <GripVertical size={10} className="text-text-muted" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          {note.isPinned && <Pin size={9} className="text-accent-yellow flex-shrink-0" />}
          <p className={`text-xs font-medium truncate ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
            {note.title || "Untitled"}
          </p>
        </div>
        {note.preview && <p className="text-[11px] text-text-muted truncate mb-1">{note.preview}</p>}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {note.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-px rounded-full" style={{ background: "rgba(177,83,215,0.12)", color: "#c8aaee" }}>
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-text-muted flex-shrink-0">{timeAgo}</p>
        </div>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded-lg hover:bg-red-500/15 hover:text-red-400 text-text-muted transition-colors flex-shrink-0"
          >
            <Trash2 size={11} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}