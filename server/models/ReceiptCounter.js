import mongoose from 'mongoose';

const receiptCounterSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

export default mongoose.model('ReceiptCounter', receiptCounterSchema);
