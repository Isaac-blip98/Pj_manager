import { User } from '@prisma/client';

export interface AuthReponse {
  User: UserResponse;
  access_token: string;
}

export interface UserResponse {
  id: number;
  email: string;
  role: string; 
  IsActive: boolean;
  CreatedAt: Date;
  UpdatedAt: Date;
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
