import mongoose from 'mongoose';

const todoPageSchema = new mongoose.Schema({
  pageName: { type: String, required: true },
  pageDescription: { type: String, required: true },
  pagetag: { type: Array },
  favourite: { type: Boolean },
  date: { type: String, required: true },
});

export default mongoose.model('TodoPage', todoPageSchema);
