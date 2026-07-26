import mongoose from 'mongoose';

const remarkSchema = new mongoose.Schema({
  id: { type: String, required: true },
  authorRole: { type: String, required: true },
  authorName: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true }
});

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  departmentId: { type: String, required: true },
  departmentName: { type: String, required: true },
  category: { type: String, required: true },
  building: { type: String, required: true },
  roomNumber: { type: String, required: true },
  imageUrls: [{ type: String }],
  createdDate: { type: String, required: true },
  updatedDate: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  contactNumber: { type: String },
  location: { type: String },
  isEmergency: { type: Boolean, default: false },

  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentDepartment: { type: String },

  assignedStaffId: { type: String },
  assignedStaffName: { type: String },

  status: { type: String, enum: ['pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  expectedCompletionDate: { type: String },

  remarks: [remarkSchema],
  solutionImageUrls: [{ type: String }],
  solutionNotes: { type: String },

  rating: {
    score: { type: Number },
    comment: { type: String },
    date: { type: String }
  },

  aiAnalysis: {
    predictedCategory: { type: String },
    predictedPriority: { type: String },
    confidence: { type: Number },
    sentiment: { type: String },
    urgencyScore: { type: Number }
  }
});

export const ComplaintModel = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
