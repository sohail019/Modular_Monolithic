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
