import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../Users/dtos/createuser.dto';
import { UpdateUserDto } from '../Users/dtos/updateuser.dto';
import { UserResponseDto } from '../Users/dtos/user-response.dto';
import { CloudinaryService } from '../shared/utils/cloudinary/cloudinary.service';
import { LoginDto } from './dtos/logindto';
import { UserRole } from '@prisma/client';
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
interface PaginationOptions {
    page?: number;
    limit?: number;
}
export declare class UsersService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    private sanitizeUser;
    create(data: CreateUserDto): Promise<ApiResponse<UserResponseDto>>;
    findAll(options?: PaginationOptions): Promise<ApiResponse<UserResponseDto[]>>;
    findActive(options?: PaginationOptions): Promise<ApiResponse<UserResponseDto[]>>;
    findByRole(role: UserRole, options?: PaginationOptions): Promise<ApiResponse<UserResponseDto[]>>;
    findOne(id: string): Promise<ApiResponse<UserResponseDto>>;
    getById(id: string): Promise<ApiResponse<UserResponseDto>>;
    findByEmail(email: string): Promise<UserResponseDto | null>;
    update(id: string, data: UpdateUserDto): Promise<ApiResponse<UserResponseDto>>;
    remove(id: string): Promise<ApiResponse<{
        message: string;
    }>>;
    login(credentials: LoginDto): Promise<ApiResponse<UserResponseDto>>;
    uploadProfileImage(id: string, file: Express.Multer.File): Promise<ApiResponse<UserResponseDto>>;
}
export {};
