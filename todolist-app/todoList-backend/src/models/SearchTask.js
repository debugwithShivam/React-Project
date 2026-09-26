import mongoose from 'mongoose';

const searchTaskSchema = new mongoose.Schema({
  searchInput: { type: String, required: true, trim: true },
  currantDate: { type: String, required: true },
  paused: { type: Boolean },
  complet: { type: Boolean },
  isDisabled: { type: Boolean, default: false },
  duration: { type: Number },
});

export default mongoose.model('Task', searchTaskSchema);
