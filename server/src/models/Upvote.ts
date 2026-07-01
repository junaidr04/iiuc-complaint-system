import mongoose, { Schema, Document } from "mongoose";

export interface IUpvote extends Document {
  complaint_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UpvoteSchema = new Schema<IUpvote>(
  {
    complaint_id: { type: Schema.Types.ObjectId, ref: "Complaint", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Ekjon user ekbar-i upvote dite parbe ekta complaint-e
UpvoteSchema.index({ complaint_id: 1, user_id: 1 }, { unique: true });

export const Upvote = mongoose.model<IUpvote>("Upvote", UpvoteSchema);