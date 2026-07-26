import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true }
});

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
