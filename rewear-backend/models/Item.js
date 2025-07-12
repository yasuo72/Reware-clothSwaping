import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: String, required: true },
    condition: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ['pending', 'available', 'swapped'], default: 'pending' },
    pointsValue: { type: Number, default: 10 },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Item', itemSchema);
