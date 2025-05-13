import Auth from "./auth.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequestBody } from "./auth.types";
import { addUser } from "../../shared/user.service";

const saltRounds = 10;

export const createUser = async (data: AuthRequestBody) => {
  const {
    email,
    password,
    login_provider,
    full_name,
    phone,
    date_of_birth,
    profile_image,
    address,
  } = data;

  const password_hash = await bcrypt.hash(password, saltRounds);

  const authUser = new Auth({
    email,
    password_hash,
    login_provider,
    is_verified: false,
    is_active: true,
    role: "user",
    permissions: [],
    created_at: new Date(),
    updated_at: new Date(),
  });

  await authUser.save();

  // Add user to the User collection using the shared service
  await addUser({
    auth_id: authUser.id,
    full_name,
    phone,
    date_of_birth,
    profile_image,
    address,
  });

  return authUser;
};

export const validateUser = async (email: string, password: string) => {
  const user = await Auth.findOne({ email, is_deleted: false });
  if (!user) throw new Error("User not found");
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");
  return user;
};

export const generateToken = (user: any) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });
};

export const login = async (
  data: Pick<AuthRequestBody, "email" | "password">
) => {
  const { email, password } = data;
  const user = await validateUser(email, password);
  const token = generateToken(user);
  return { token, user };
};
