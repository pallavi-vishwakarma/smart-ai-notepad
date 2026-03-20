/**
 * Note Model with Version History
 */

const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
  content: String,
  title: String,
  savedAt: { type: Date, default: Date.now },
});

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Note",
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 20,
        message: "Cannot have more than 20 tags",
      },
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "#1e1e2e",
    },
    versions: {
      type: [versionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for fast querying ────────────────────────────────────────────
noteSchema.index({ user: 1, updatedAt: -1 });
noteSchema.index({ user: 1, tags: 1 });
noteSchema.index({ user: 1, title: "text", content: "text" });

// ─── Keep max 10 versions ─────────────────────────────────────────────────
noteSchema.methods.addVersion = function () {
  this.versions.unshift({ content: this.content, title: this.title });
  if (this.versions.length > 10) {
    this.versions = this.versions.slice(0, 10);
  }
};

module.exports = mongoose.model("Note", noteSchema);
