import { User } from '@prisma/client';

export interface AuthReponse {
  user: UserResponse;
  access_token: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string; 
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayLoad {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

export type AuthUser = Omit<User, 'password'>;
