import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import { UserRole } from '@prisma/client';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { UserResponseDto } from '../Users/dtos/user-response.dto';
import * as bcrypt from 'bcrypt';
import { AuthReponse } from './Interface/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthReponse>> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          password: hashedPassword,
          role: UserRole.USER,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          profileImage: true,
        },
      });

      return {
        success: true,
        message: 'Registration successful. Please login to continue.',
        data: user,
      };
    } catch {
      throw new BadRequestException('Failed to register user');
    }
  }
}
