import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  complaintId: { type: String },
  read: { type: Boolean, default: false },
  date: { type: String, required: true }
});

export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
