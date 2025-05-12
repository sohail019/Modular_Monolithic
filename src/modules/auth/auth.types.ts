export interface AuthRequestBody {
  email: string;
  password: string;
  login_provider: string;
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
