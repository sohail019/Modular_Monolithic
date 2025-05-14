import Auth, { RevokedToken } from "./auth.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AuthRequestBody } from "./auth.types";
import { addUser } from "../../shared/user.service";
import * as userService from "../../modules/user/user.service";

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh-secret";
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

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

  // Check if user already exists
  const existingUser = await Auth.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const password_hash = await bcrypt.hash(password, saltRounds);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token valid for 24 hours

  const authUser = new Auth({
    email,
    password_hash,
    login_provider,
    is_verified: false,
    is_active: true,
    role: "user",
    permissions: [],
    verification_token: verificationToken,
    verification_token_expires: tokenExpiry,
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

  return {
    user: authUser,
    verification_token: verificationToken,
  };
};

export const validateUser = async (email: string, password: string) => {
  const user = await Auth.findOne({ email, is_deleted: false });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");

  if (!user.is_active) throw new Error("Account is deactivated");

  // Update last login time
  user.last_login_at = new Date();
  await user.save();

  return user;
};

// export const generateTokens = (user: any) => {
//   const accessPayload = {
//     id: user.id,
//     email: user.email,
//     role: user.role,
//     permissions: user.permissions,
//     type: "access",
//   };

//   const refreshPayload = {
//     id: user.id,
//     type: "refresh",
//   };

//   const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
//     expiresIn: ACCESS_TOKEN_EXPIRY,
//   });

//   const refreshToken = jwt.sign(refreshPayload, REFRESH_SECRET, {
//     expiresIn: REFRESH_TOKEN_EXPIRY,
//   });

//   return { accessToken, refreshToken };
// };

export const generateTokens = async (authUser: any) => {
  // Fetch the user details using the auth_id
  const user = await userService.getUserByAuthId(authUser._id);

  if (!user) {
    throw new Error("User not found");
  }

  const accessPayload = {
    id: user._id, // Use user_id from the User table
    auth_id: authUser._id, // Use auth_id from the Auth table
    email: authUser.email,
    role: authUser.role,
    permissions: authUser.permissions,
    type: "access",
  };

  const refreshPayload = {
    id: user._id, // Use user_id from the User table
    auth_id: authUser._id, // Use auth_id from the Auth table
    type: "refresh",
  };

  const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(refreshPayload, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

export const login = async (
  data: Pick<AuthRequestBody, "email" | "password">
) => {
  const { email, password } = data;
  const user = await validateUser(email, password);

  const { accessToken, refreshToken } = await generateTokens(user);

  // Store refresh token in the database
  user.refresh_tokens = user.refresh_tokens || [];
  user.refresh_tokens.push(refreshToken);

  // Limit the number of stored refresh tokens (e.g., max 5 per user)
  while (user.refresh_tokens.length > 5) {
    user.refresh_tokens.shift(); // Remove the oldest token
  }

  await user.save();

  return {
    token: accessToken,
    refresh_token: refreshToken,
    user,
  };
};

export const logout = async (token: string, userId: string) => {
  // Add the token to revoked tokens list
  const revokedToken = new RevokedToken({
    token,
    user_id: userId,
    revoked_at: new Date(),
  });

  await revokedToken.save();

  // Remove the refresh token from the user's refresh tokens
  await Auth.findByIdAndUpdate(userId, {
    $pull: { refresh_tokens: token },
  });

  return { message: "Logged out successfully" };
};

export const refreshToken = async (token: string) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(token, REFRESH_SECRET) as jwt.JwtPayload;

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    // Check if token is revoked
    const revokedTokenDoc = await RevokedToken.findOne({ token });
    if (revokedTokenDoc) {
      throw new Error("Token has been revoked");
    }

    // Get user with this refresh token
    const user = await Auth.findOne({
      _id: decoded.id,
      refresh_tokens: token,
    });

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    // Generate new tokens
    const tokens = await generateTokens(user);

    // Replace the old refresh token with the new one
    const tokenIndex = user.refresh_tokens.indexOf(token);
    user.refresh_tokens[tokenIndex] = tokens.refreshToken;
    await user.save();

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_in: 3600, // 1 hour in seconds
    };
  } catch (error) {
    // Revoke the token if it exists but there was another error
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      if (decoded && decoded.id) {
        await Auth.findByIdAndUpdate(decoded.id, {
          $pull: { refresh_tokens: token },
        });
      }
    } catch (e) {
      // Ignore errors here
    }

    throw new Error("Invalid refresh token");
  }
};

export const getProfile = async (userId: string) => {
  const authUser = await Auth.findById(userId, {
    password_hash: 0,
    refresh_tokens: 0,
  });

  if (!authUser) {
    throw new Error("User not found");
  }

  const userDetails = await userService.getUserByAuthId(userId);

  return {
    auth: authUser,
    profile: userDetails,
  };
};

export const verifyEmail = async (token: string) => {
  const user = await Auth.findOne({
    verification_token: token,
    verification_token_expires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error("Invalid or expired verification token");
  }

  user.is_verified = true;
  user.verification_token = undefined;
  user.verification_token_expires = undefined;

  await user.save();

  return { message: "Email verified successfully" };
};

export const sendVerificationEmail = async (email: string) => {
  const user = await Auth.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.is_verified) {
    throw new Error("Email already verified");
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token valid for 24 hours

  user.verification_token = verificationToken;
  user.verification_token_expires = tokenExpiry;

  await user.save();

  // In a real application, send an email with the verification link
  // For now, just return the token for testing
  return {
    message: "Verification email sent",
    token: verificationToken, // In production, this would be sent via email not returned
  };
};

export const isTokenRevoked = async (token: string) => {
  const revokedToken = await RevokedToken.findOne({ token });
  return !!revokedToken;
};

export const getAuthById = async (authId: string) => {
  try {
    const auth = await Auth.findById(authId, {
      password_hash: 0, // Exclude sensitive data
      refresh_tokens: 0, // Exclude tokens for security
      verification_token: 0,
      verification_token_expires: 0,
    });

    if (!auth) {
      throw new Error("Auth record not found");
    }

    return auth;
  } catch (error) {
    throw new Error(`Error fetching auth data: ${error.message}`);
  }
};
