import mongoose, { Schema, Document } from "mongoose";

export type ComplaintStatus = "pending" | "in_review" | "resolved";

export interface IComplaint extends Document {
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  is_anonymous: boolean;
  department_id: mongoose.Types.ObjectId | null;
  status: ComplaintStatus;
  created_by: mongoose.Types.ObjectId;
  assigned_authority_id: mongoose.Types.ObjectId | null;
  upvote_count: number;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    image_url: { type: String, default: null },
    is_anonymous: { type: Boolean, default: false },
    department_id: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    status: { type: String, enum: ["pending", "in_review", "resolved"], default: "pending" },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assigned_authority_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
    upvote_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Complaint = mongoose.model<IComplaint>("Complaint", ComplaintSchema);