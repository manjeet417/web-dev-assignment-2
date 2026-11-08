const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", trim: true },
    content: { type: String, default: "" },
    color: {
      type: String,
      enum: ["yellow", "mint", "lilac", "peach", "sky"],
      default: "yellow",
    },
    pinned: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true }
);

const noteModel = mongoose.model("note", noteSchema);

module.exports = { noteModel };
