import mongoose from 'mongoose';

const expenditureSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  amount: { type: Number, required: true, min: 0, default: 0 },
  isLocked: { type: Boolean, default: false },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Expenditure', expenditureSchema);
