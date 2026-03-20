import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ChevronRight } from "lucide-react";
import { useNotesStore } from "../store/notesStore";
import NotesList from "../components/notes/NotesList";
import RichEditor from "../components/editor/RichEditor";
import AIPanel from "../components/ai/AIPanel";
import Header from "../components/layout/Header";

export default function Dashboard() {
  const { fetchNotes, fetchTags, createNote, notes } = useNotesStore();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAI, setShowAI] = useState(true);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, []);

  const handleTextSelect = useCallback((text) => {
    setSelectedText(text || "");
  }, []);

  return (
    <div className="flex flex-col h-screen bg-space-950 overflow-hidden">
      <Header
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar((s) => !s)}
        showAI={showAI}
        onToggleAI={() => setShowAI((s) => !s)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Notes Sidebar */}
        <AnimatePresence initial={false}>
          {showSidebar && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden border-r border-space-700 bg-space-900 flex-shrink-0"
            >
              <div className="w-[280px] h-full">
                <NotesList />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center: Editor */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {notes.length === 0 ? (
            <EmptyState onCreateNote={createNote} />
          ) : (
            <RichEditor onTextSelect={handleTextSelect} />
          )}
        </main>

        {/* Right: AI Panel */}
        <AnimatePresence initial={false}>
          {showAI && (
            <motion.aside
              key="ai-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden border-l border-space-700 bg-space-900 flex-shrink-0"
            >
              <div className="w-[360px] h-full">
                <AIPanel selectedText={selectedText} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({ onCreateNote }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-space-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-space-600">
          <BrainCircuit size={40} className="text-accent-purple" />
        </div>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
          No notes yet
        </h2>
        <p className="text-text-secondary text-sm mb-6 max-w-xs">
          Create your first AI-powered note and start writing smarter.
        </p>
        <button
          onClick={onCreateNote}
          className="bg-gradient-to-r from-accent-purple to-accent-blue text-white px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all glow-purple"
        >
          Create First Note
          <ChevronRight size={16} />
        </button>
      </motion.div>
    </div>
  );
}
