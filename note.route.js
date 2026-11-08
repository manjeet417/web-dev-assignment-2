const express = require("express");
const { noteModel } = require("../model/note.model");
const noteRouter = express.Router();

// All routes here run behind the auth middleware, so req.userId is set.

// Get my notes (optional ?search=text)
noteRouter.get("/", async (req, res) => {
  try {
    const filter = { userId: req.userId };
    const { search } = req.query;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: rx }, { content: rx }];
    }
    const notes = await noteModel.find(filter).sort({ pinned: -1, updatedAt: -1 });
    res.send({ notes });
  } catch (error) {
    res.status(500).send({ msg: "Could not load notes" });
  }
});

// Create a note
noteRouter.post("/", async (req, res) => {
  try {
    const { title, content, color, pinned } = req.body;
    if (!title && !content) {
      return res.status(400).send({ msg: "Add a title or some content" });
    }
    const note = await new noteModel({ title, content, color, pinned, userId: req.userId }).save();
    res.status(201).send({ msg: "Note created", note });
  } catch (error) {
    res.status(400).send({ msg: "Could not create note" });
  }
});

// Update a note (only my own)
noteRouter.patch("/:id", async (req, res) => {
  try {
    const { title, content, color, pinned } = req.body;
    const note = await noteModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, content, color, pinned },
      { new: true, omitUndefined: true, runValidators: true }
    );
    if (!note) return res.status(404).send({ msg: "Note not found" });
    res.send({ msg: "Note updated", note });
  } catch (error) {
    res.status(400).send({ msg: "Could not update note" });
  }
});

// Delete a note (only my own)
noteRouter.delete("/:id", async (req, res) => {
  try {
    const note = await noteModel.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).send({ msg: "Note not found" });
    res.send({ msg: "Note deleted" });
  } catch (error) {
    res.status(400).send({ msg: "Could not delete note" });
  }
});

module.exports = { noteRouter };
