import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student', required: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  avatarUrl: { type: String },
  department: { type: String },
  session: { type: String },
  phone: { type: String },
  studentIdNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
