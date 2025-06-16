import { UsersService, ApiResponse } from './users.service';
import { CreateUserDto } from './dtos/createuser.dto';
import { UpdateUserDto } from './dtos/updateuser.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { LoginDto } from './dtos/logindto';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<ApiResponse<UserResponseDto>>;
    findAll(page?: string, limit?: string): Promise<ApiResponse<UserResponseDto[]>>;
    findActive(page?: string, limit?: string): Promise<ApiResponse<UserResponseDto[]>>;
    findByRole(role: UserRole, page?: string, limit?: string): Promise<ApiResponse<UserResponseDto[]>>;
    findOne(id: string): Promise<ApiResponse<UserResponseDto>>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<ApiResponse<UserResponseDto>>;
    remove(id: string): Promise<ApiResponse<{
        message: string;
    }>>;
    login(loginDto: LoginDto): Promise<ApiResponse<UserResponseDto>>;
}
