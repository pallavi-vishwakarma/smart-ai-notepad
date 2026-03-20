/**
 * Notes Store - Zustand state management for notes
 */
import { create } from "zustand";
import { notesApi } from "../api/notesApi";
import toast from "react-hot-toast";

export const useNotesStore = create((set, get) => ({
  notes: [],
  activeNoteId: null,
  loading: false,
  saving: false,
  searchQuery: "",
  activeTag: null,
  tags: [],

  // ─── Fetch all notes ─────────────────────────────────────────────
  fetchNotes: async () => {
    set({ loading: true });
    try {
      const { notes } = await notesApi.getNotes();
      set({ notes, loading: false });
      // Auto-select first note
      if (notes.length > 0 && !get().activeNoteId) {
        get().selectNote(notes[0]._id);
      }
    } catch {
      set({ loading: false });
      toast.error("Failed to load notes");
    }
  },

  fetchTags: async () => {
    try {
      const { tags } = await notesApi.getTags();
      set({ tags });
    } catch {}
  },

  createNote: async () => {
    try {
      const { note } = await notesApi.createNote({ title: "Untitled Note", content: "", tags: [] });
      set((state) => ({ notes: [note, ...state.notes], activeNoteId: note._id }));
      return note;
    } catch {
      toast.error("Failed to create note");
    }
  },

  selectNote: async (id) => {
    if (!id) return;
    const existing = get().notes.find((n) => n._id === id);

    // If we already have full content (not just a preview), just activate
    if (existing && existing.content !== undefined && existing.content !== null) {
      set({ activeNoteId: id });
      return existing;
    }

    // Fetch full note (content wasn't loaded in list view)
    set({ activeNoteId: id }); // optimistic set
    try {
      const { note } = await notesApi.getNoteById(id);
      set((state) => ({
        notes: state.notes.map((n) => (n._id === id ? { ...n, ...note } : n)),
      }));
      return note;
    } catch {
      toast.error("Failed to load note");
    }
  },

  updateNote: async (id, updates, saveVersion = false) => {
    // Optimistic update
    set((state) => ({
      notes: state.notes.map((n) => (n._id === id ? { ...n, ...updates } : n)),
      saving: true,
    }));
    try {
      const { note } = await notesApi.updateNote(id, { ...updates, saveVersion });
      set((state) => ({
        notes: state.notes.map((n) => (n._id === id ? { ...n, ...note } : n)),
        saving: false,
      }));
    } catch {
      set({ saving: false });
      toast.error("Failed to save note");
    }
  },

  deleteNote: async (id) => {
    try {
      await notesApi.deleteNote(id);
      set((state) => {
        const remaining = state.notes.filter((n) => n._id !== id);
        const newActive =
          state.activeNoteId === id
            ? remaining[0]?._id || null
            : state.activeNoteId;
        return { notes: remaining, activeNoteId: newActive };
      });
      toast.success("Note deleted");
      // Load full content for newly active note
      const newActiveId = get().activeNoteId;
      if (newActiveId) get().selectNote(newActiveId);
    } catch {
      toast.error("Failed to delete note");
    }
  },

  reorderNotes: async (orderedIds) => {
    set((state) => {
      const map = Object.fromEntries(state.notes.map((n) => [n._id, n]));
      return { notes: orderedIds.map((id) => map[id]).filter(Boolean) };
    });
    try { await notesApi.reorderNotes(orderedIds); } catch {}
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveTag:   (t) => set({ activeTag: t }),
}));
