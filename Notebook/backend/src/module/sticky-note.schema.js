import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "Untitled",
    },

    type: {
      type: String,
      enum: ["text", "code"],
      default: "text",
    },

    content: {
      type: String,
      default: "",
    },

    html: {
      type: String,
      default: "",
    },

    css: {
      type: String,
      default: "",
    },

    javascript: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

export default Note