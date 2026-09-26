import mongoose from 'mongoose';

const loginSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  lastname: { type: String, required: true },
});

export default mongoose.model('Login', loginSchema);
