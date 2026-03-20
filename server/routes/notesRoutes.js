const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getNotes, getNoteById, createNote, updateNote,
  deleteNote, getNoteVersions, reorderNotes, getTags,
} = require("../controllers/notesController");

// All routes are protected
router.use(protect);

router.get("/tags", getTags);
router.post("/reorder", reorderNotes);
router.route("/").get(getNotes).post(createNote);
router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);
router.get("/:id/versions", getNoteVersions);

module.exports = router;
