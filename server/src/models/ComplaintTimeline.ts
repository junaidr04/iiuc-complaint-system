import mongoose, { Schema, Document } from "mongoose";
import type { ComplaintStatus } from "./Complaint.js";

export interface IComplaintTimeline extends Document {
  complaint_id: mongoose.Types.ObjectId;
  status: ComplaintStatus;
  changed_by: mongoose.Types.ObjectId;
  note: string | null;
  createdAt: Date;
}

const ComplaintTimelineSchema = new Schema<IComplaintTimeline>(
  {
    complaint_id: { type: Schema.Types.ObjectId, ref: "Complaint", required: true },
    status: { type: String, enum: ["pending", "in_review", "resolved"], required: true },
    changed_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ComplaintTimeline = mongoose.model<IComplaintTimeline>(
  "ComplaintTimeline",
  ComplaintTimelineSchema
);