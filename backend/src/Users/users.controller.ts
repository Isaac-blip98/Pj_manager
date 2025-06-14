// src/Users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService, ApiResponse } from './users.service';
import { CreateUserDto } from './dtos/createuser.dto';
import { UpdateUserDto } from './dtos/updateuser.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { LoginDto } from './dtos/logindto';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<UserResponseDto>> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const paginationOptions = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.usersService.findAll(paginationOptions);
  }

  @Get('active')
  async findActive(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const paginationOptions = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.usersService.findActive(paginationOptions);
  }

  @Get('role/:role')
  async findByRole(
    @Param('role') role: UserRole,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const paginationOptions = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.usersService.findByRole(role, paginationOptions);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<UserResponseDto>> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<{ message: string }>> {
    return this.usersService.remove(id);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<UserResponseDto>> {
    return this.usersService.login(loginDto);
  }

  // Additional endpoints
  @Post(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() body: { oldPassword: string; newPassword: string }
  ): Promise<ApiResponse<{ message: string }>> {
    return this.usersService.changePassword(id, body.oldPassword, body.newPassword);
  }

  @Post(':id/reactivate')
  async reactivateUser(@Param('id') id: string): Promise<ApiResponse<UserResponseDto>> {
    return this.usersService.reactivateUser(id);
  }
}