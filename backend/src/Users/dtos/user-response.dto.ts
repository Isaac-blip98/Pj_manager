import { UserRole } from '@prisma/client';

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  profileImage?: string | null;
  role!: UserRole;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  assignedProject?: {
    id: string;
    name: string;
  } | null;
}
