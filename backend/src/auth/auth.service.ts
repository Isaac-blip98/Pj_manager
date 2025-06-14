import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dtos/register.dto';
import {
  AuthReponse,
  JwtPayLoad,
  UserResponse,
} from './Interface/auth.interface';

@Injectable()
export class AuthService {
  private readonly prisma = new PrismaClient();

  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verify(token);
  }

  async login(email: string, password: string): Promise<AuthReponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async register(data: RegisterDto): Promise<AuthReponse> {
    const { email, name, password } = data;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: {
          connect: { name: UserRole.USER },
        },
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(
    user: User & { role: { name: string } },
  ): AuthReponse {
    const payload: JwtPayLoad = {
        email: user.email,
        userId: user.id,
        role: user.role.name,
    };

    const userResponse: UserResponse = {
      id: Number(user.id),
      email: user.email,
      role: user.role.name,
      IsActive: user.isActive,
      CreatedAt: user.createdAt,
      UpdatedAt: user.updatedAt,
    };

    return {
      User: userResponse,
      access_token: this.jwtService.sign(payload),
    };
  }
}
