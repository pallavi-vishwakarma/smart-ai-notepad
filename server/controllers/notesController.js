/**
 * Notes Controller - Full CRUD + Version History + Search
 */

const Note = require("../models/Note");
const logger = require("../utils/logger");

// ─── GET all notes ────────────────────────────────────────────────
const getNotes = async (req, res, next) => {
  try {
    const { tag, search, sort = "-updatedAt" } = req.query;
    const query = { user: req.user._id };

    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Exclude versions (large), but include content for editor
    const notes = await Note.find(query)
      .select("-versions")
      .sort(sort)
      .lean();

    // Add plain-text preview
    const result = notes.map((n) => ({
      ...n,
      preview: n.content
        ? n.content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").substring(0, 150).trim()
        : "",
    }));

    res.json({ notes: result, count: result.length });
  } catch (error) {
    next(error);
  }
};

// ─── GET single note (includes versions) ─────────────────────────
const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ note });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE note ──────────────────────────────────────────────────
const createNote = async (req, res, next) => {
  try {
    const { title, content, tags, color } = req.body;
    const count = await Note.countDocuments({ user: req.user._id });
    const note = await Note.create({
      user: req.user._id,
      title: title || "Untitled Note",
      content: content || "",
      tags: tags || [],
      color: color || "#1e1e2e",
      order: count,
    });
    logger.info(`Note created: ${note._id} by user ${req.user._id}`);
    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE note ──────────────────────────────────────────────────
const updateNote = async (req, res, next) => {
  try {
    const { title, content, tags, isPinned, color, saveVersion } = req.body;
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: "Note not found" });

    // Save version snapshot before significant changes
    if (saveVersion && (note.content !== content || note.title !== title)) {
      note.addVersion();
    }

    if (title   !== undefined) note.title   = title;
    if (content !== undefined) note.content = content;
    if (tags    !== undefined) note.tags    = tags;
    if (isPinned!== undefined) note.isPinned= isPinned;
    if (color   !== undefined) note.color   = color;

    await note.save();
    // Return without versions to keep payload small
    const obj = note.toObject();
    delete obj.versions;
    res.json({ note: obj });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE note ──────────────────────────────────────────────────
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: "Note not found" });
    logger.info(`Note deleted: ${req.params.id}`);
    res.json({ message: "Note deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// ─── GET version history ──────────────────────────────────────────
const getNoteVersions = async (req, res, next) => {
  try {
    const note = await Note.findOne(
      { _id: req.params.id, user: req.user._id },
      "versions title"
    );
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ versions: note.versions });
  } catch (error) {
    next(error);
  }
};

// ─── Reorder notes ────────────────────────────────────────────────
const reorderNotes = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return res.status(400).json({ error: "orderedIds must be an array" });
    const ops = orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id, user: req.user._id }, update: { order: i } },
    }));
    await Note.bulkWrite(ops);
    res.json({ message: "Reordered" });
  } catch (error) {
    next(error);
  }
};

// ─── Get all tags ─────────────────────────────────────────────────
const getTags = async (req, res, next) => {
  try {
    const tags = await Note.distinct("tags", { user: req.user._id });
    res.json({ tags: tags.filter(Boolean) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote, getNoteVersions, reorderNotes, getTags };
