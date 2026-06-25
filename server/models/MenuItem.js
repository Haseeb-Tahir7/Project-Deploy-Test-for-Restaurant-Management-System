import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  emoji: { type: String, default: '🍽️' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, default: 'General', trim: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('MenuItem', menuItemSchema);
