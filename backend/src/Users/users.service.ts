import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../Users/dtos/createuser.dto';
import { UpdateUserDto } from '../Users/dtos/updateuser.dto';
import { UserResponseDto } from '../Users/dtos/user-response.dto';
import * as bcrypt from 'bcryptjs';
import { CloudinaryService } from '../shared/utils/cloudinary/cloudinary.service';
import { LoginDto } from './dtos/logindto';
import { Prisma, UserRole } from '@prisma/client';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private sanitizeUser(user: any): UserResponseDto {
    const { password, ...rest } = user;
    return rest as UserResponseDto;
  }


async create(data: CreateUserDto): Promise<ApiResponse<UserResponseDto>> {
  if (!data.password) {
    throw new BadRequestException('Password is required');
  }

  if (data.password.length < 8) {
    throw new BadRequestException(
      'Password must be at least 8 characters long',
    );
  }

  if (data.role && !Object.values(UserRole).includes(data.role as UserRole)) {
    throw new BadRequestException('Invalid role provided');
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  try {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role ?? UserRole.USER, // default role if not provided
      },
    });

    return {
      success: true,
      message: 'User created successfully',
      data: this.sanitizeUser(user),
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
    }
    throw new BadRequestException('Failed to create user');
  }
}

  async findAll(
    options: PaginationOptions = {},
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users.map((user) => this.sanitizeUser(user)),
    };
  }

  async findActive(
    options: PaginationOptions = {},
  ): Promise<ApiResponse<UserResponseDto[]>> {
    return this.findAll(options);
  }

  async findByRole(
    role: UserRole,
    options: PaginationOptions = {},
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          isActive: true,
          role,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: {
          isActive: true,
          role,
        },
      }),
    ]);

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users.map((user) => this.sanitizeUser(user)),
    };
  }

  async findOne(id: string): Promise<ApiResponse<UserResponseDto>> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'User retrieved successfully',
      data: this.sanitizeUser(user),
    };
  }

  async getById(id: string): Promise<ApiResponse<UserResponseDto>> {
    return this.findOne(id);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email, isActive: true },
    });

    return user ? this.sanitizeUser(user) : null;
  }

  async update(
    id: string,
    data: UpdateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser || !existingUser.isActive) {
      throw new NotFoundException('User not found');
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;

    if (data.password) {
      if (data.password.length < 8) {
        throw new BadRequestException(
          'Password must be at least 8 characters long',
        );
      }
      updateData.password = await bcrypt.hash(data.password, 12);
    }
if (data.role && !Object.values(UserRole).includes(data.role as UserRole)) {
  throw new BadRequestException('Invalid role');
}

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'User updated successfully',
        data: this.sanitizeUser(updatedUser),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: string): Promise<ApiResponse<{ message: string }>> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        success: true,
        message: 'User deactivated successfully',
        data: { message: 'User deactivated successfully' },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to deactivate user');
    }
  }

  async login(credentials: LoginDto): Promise<ApiResponse<UserResponseDto>> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      success: true,
      message: 'Login successful',
      data: this.sanitizeUser(user),
    };
  }

  async uploadProfileImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    try {
      const uploaded = await this.cloudinaryService.upload(file);

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { profileImage: uploaded.secure_url },
      });

      return {
        success: true,
        message: 'Profile image uploaded successfully',
        data: this.sanitizeUser(updatedUser),
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload profile image');
    }
  }
}
