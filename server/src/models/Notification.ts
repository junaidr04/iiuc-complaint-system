import mongoose, { Schema, Document } from "mongoose";

export type NotificationType = "status_change" | "new_comment" | "assigned" | "resolved";

export interface INotification extends Document {
  receiver_id: mongoose.Types.ObjectId;
  complaint_id: mongoose.Types.ObjectId | null;
  message: string;
  type: NotificationType;
  is_read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    receiver_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    complaint_id: { type: Schema.Types.ObjectId, ref: "Complaint", default: null },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["status_change", "new_comment", "assigned", "resolved"],
      required: true,
    },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);