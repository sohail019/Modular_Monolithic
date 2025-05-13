import { Schema, model, Document } from "mongoose";

export interface IAuth extends Document {
  email: string;
  password_hash: string;
  login_provider: string;
  is_verified: boolean;
  is_deleted: boolean;
  is_active: boolean;
  role: string;
  permissions: string[];
  last_login_at: Date | null;
  verification_token?: string;
  verification_token_expires?: Date;
  refresh_tokens?: string[];
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
  verification_token: { type: String },
  verification_token_expires: { type: Date },
  refresh_tokens: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Add indexes for better performance
authSchema.index({ email: 1 }, { unique: true });
authSchema.index({ verification_token: 1 }, { sparse: true });

const Auth = model<IAuth>("Auth", authSchema);

// Create a schema for revoked tokens
export interface IRevokedToken extends Document {
  token: string;
  revoked_at: Date;
  user_id: string;
}

const revokedTokenSchema = new Schema<IRevokedToken>({
  token: { type: String, required: true, unique: true },
  revoked_at: { type: Date, default: Date.now },
  user_id: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
});

revokedTokenSchema.index({ token: 1 }, { unique: true });
revokedTokenSchema.index({ user_id: 1 });

const RevokedToken = model<IRevokedToken>("RevokedToken", revokedTokenSchema);

export default Auth;
export { RevokedToken };
