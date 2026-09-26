import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  Pasued: { type: Boolean },
  complet: { type: Boolean },
  duration: { type: Number },
  createdAt: { type: Date },
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TodoPage',
    required: true,
  },
  date: { type: String, required: true },
});

export default mongoose.model('Todo', todoSchema);
