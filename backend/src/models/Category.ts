import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  departmentId: { type: String, required: true },
  departmentName: { type: String, required: true },
  description: { type: String, required: true }
});

export const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema);
