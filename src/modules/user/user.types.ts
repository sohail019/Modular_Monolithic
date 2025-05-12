import { Document } from "mongoose";

// Request types
export interface CreateUserDto {
  auth_id: string;
  full_name: string;
  phone?: string;
  date_of_birth?: Date;
}

export interface UpdateUserDto {
  full_name?: string;
  phone?: string;
  date_of_birth?: Date;
  is_completed?: boolean;
}

export interface UpdateAddressDto {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface UpdateProfileImageDto {
  profile_image: string;
}

// Response types
export interface UserResponseDto {
  id: string;
  auth_id: string;
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
