import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id: string;
  auth_id: mongoose.Types.ObjectId;
  full_name: string;
  phone: string;
  profile_image: string;
  date_of_birth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>({
  auth_id: {
    type: Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  profile_image: {
    type: String,
    default: "",
  },
  date_of_birth: {
    type: Date,
    default: null,
  },
  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postal_code: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  is_completed: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Check if model exists before compiling
const User = mongoose.model<IUser>("User", userSchema);

export default User;
