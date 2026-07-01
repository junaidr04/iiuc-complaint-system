import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  description: string | null;
  assigned_authority_id: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    assigned_authority_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>("Department", DepartmentSchema);