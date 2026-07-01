import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  complaint_id: mongoose.Types.ObjectId;
  author_id: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    complaint_id: { type: Schema.Types.ObjectId, ref: "Complaint", required: true },
    author_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);