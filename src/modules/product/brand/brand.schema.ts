import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  _id: string;
  name: string;
  logo_url: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
    },
    logo_url: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Add indexes for better query performance
BrandSchema.index({ name: 1 }, { unique: true });

// Prevent overwrite errors by checking if the model exists
const BrandModel = mongoose.model<IBrand>("Brand", BrandSchema);

export { BrandModel };
