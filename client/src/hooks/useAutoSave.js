/**
 * useAutoSave - Debounced auto-save with localStorage draft fallback
 */
import { useEffect, useRef } from "react";

const AUTOSAVE_DELAY = 2000;
const LS_KEY = "notepad_drafts";

export const loadDraft = (noteId) => {
  try {
    const drafts = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return drafts[noteId] || null;
  } catch { return null; }
};

export const saveDraft = (noteId, data) => {
  try {
    const drafts = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    drafts[noteId] = { ...data, savedAt: Date.now() };
    // Keep max 50 drafts
    const keys = Object.keys(drafts);
    if (keys.length > 50) {
      delete drafts[keys.sort((a, b) => drafts[a].savedAt - drafts[b].savedAt)[0]];
    }
    localStorage.setItem(LS_KEY, JSON.stringify(drafts));
  } catch {}
};

export const clearDraft = (noteId) => {
  try {
    const drafts = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    delete drafts[noteId];
    localStorage.setItem(LS_KEY, JSON.stringify(drafts));
  } catch {}
};

/**
 * @param {string|null} noteId  - current note's _id
 * @param {object}      data    - { title, content, tags }
 * @param {function}    saveFn  - async (id, data) => void
 * @param {boolean}     enabled
 */
export const useAutoSave = (noteId, data, saveFn, enabled = true) => {
  const timerRef = useRef(null);
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  // Stringify data to use as dep-comparison value
  const dataKey = JSON.stringify(data);

  useEffect(() => {
    if (!noteId || !enabled) return;

    // Cancel previous timer
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      // Save to localStorage immediately as backup
      saveDraft(noteId, data);
      try {
        await saveFnRef.current(noteId, data);
        clearDraft(noteId);
      } catch {
        // Draft stays in localStorage as offline fallback
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, dataKey, enabled]);
};
