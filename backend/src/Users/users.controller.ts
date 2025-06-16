import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { CreateUserDto } from './dtos/createuser.dto';
import { UpdateUserDto } from './dtos/updateuser.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { LoginDto } from './dtos/logindto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../auth/Guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    // Prevent admin role creation through API
    if (createUserDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admin users can not be created');
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const paginationOptions = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.usersService.findAll(paginationOptions);
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findActive(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const paginationOptions = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.usersService.findActive(paginationOptions);
  }

  @Get('role/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findByRole(
    @Param('role') role: UserRole,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const paginationOptions = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.usersService.findByRole(role, paginationOptions);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: AuthUser,
  ): Promise<ApiResponse<UserResponseDto>> {
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: AuthUser,
  ): Promise<ApiResponse<UserResponseDto>> {
    // Check role update permission
    if (updateUserDto.role) {
      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can update user roles');
      }

      const existingUser = await this.usersService.findOne(id);
      if (existingUser?.data?.role === updateUserDto.role) {
        throw new BadRequestException(
          `User already has role ${updateUserDto.role}`,
        );
      }
    }

    // Check update permission
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<{ message: string } | null>> {
    const result = await this.usersService.remove(id);
    if (!result) {
      return { data: null, message: 'User not found', success: false };
    }
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.usersService.login(loginDto);
  }
}
