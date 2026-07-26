import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  headName: { type: String, required: true },
  headEmail: { type: String, required: true },
  description: { type: String, required: true },
  staffCount: { type: Number, default: 0 },
  activeComplaintsCount: { type: Number, default: 0 }
});

export const DepartmentModel = mongoose.models.Department || mongoose.model('Department', departmentSchema);
