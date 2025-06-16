import { UserRole } from '@prisma/client';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    roleId?: string;
    role?: UserRole;
    isActive?: boolean;
    profileImage?: string;
}
