import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

export default mongoose.model('Note', noteSchema);
