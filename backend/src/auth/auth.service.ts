import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { loginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UserRole } from '@prisma/client';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import * as bcrypt from 'bcrypt';
import { AuthReponse } from './Interface/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(
    loginDto: loginDto,
  ): Promise<ApiResponse<AuthReponse>> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
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
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful',
      data: {
        access_token,
        user: userWithoutPassword,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<ApiResponse<AuthReponse>> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        role: UserRole.USER,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const access_token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: { ...user, id: (user.id) },
        access_token,
      },
    };
  }
}
