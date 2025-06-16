import { UserRole } from '@prisma/client';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
