import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService, ApiResponse } from './users.service';
import { CreateUserDto } from './dtos/createuser.dto';
import { UpdateUserDto } from './dtos/updateuser.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { LoginDto } from './dtos/logindto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/Guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/Guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(
    @Param('id') id: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.usersService.remove(id);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.usersService.login(loginDto);
  }
}
