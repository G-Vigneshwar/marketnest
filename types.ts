export enum UserRole {
  BRAND = 'BRAND',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  password?: string; // Stored in DB, typically hashed in real apps
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}