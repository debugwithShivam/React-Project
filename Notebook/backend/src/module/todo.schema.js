import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    done: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

todoSchema.index({ userId: 1, createdAt: 1 });

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;
