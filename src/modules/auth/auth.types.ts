export interface AuthRequestBody {
  email: string;
  password: string;
  login_provider: string;
  full_name: string;
  phone?: string;
  date_of_birth?: Date;
  profile_image?: string; // New field for profile image
  address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }; // New field for address
}
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export interface RefreshTokenRequestBody {
  refresh_token: string;
}

export interface VerifyEmailRequestBody {
  token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RevokedToken {
  token: string;
  revoked_at: Date;
  user_id: string;
}
