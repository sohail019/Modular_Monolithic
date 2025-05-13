import { Schema, model, Document } from "mongoose";

export interface IAuth extends Document {
  _id: string;
  email: string;
  password_hash: string;
  login_provider: string;
  is_verified: boolean;
  is_deleted: boolean;
  is_active: boolean;
  role: string;
  permissions: string[];
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const authSchema = new Schema<IAuth>({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  login_provider: { type: String, required: true },
  is_verified: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  role: { type: String, default: "user" },
  permissions: { type: [String], default: [] },
  last_login_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Auth = model<IAuth>("Auth", authSchema);

export default Auth;
