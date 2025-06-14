import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project-dto';
import { UpdateProjectDto } from './dto/update-project-dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { ProjectResponseDto } from './dto/project-response-dto';
import { UserRole } from '@prisma/client';
import { User } from '../common/decorators/user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';

import { Roles } from '../common/decorators/roles.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  async create(
    @Body(ValidationPipe) createProjectDto: CreateProjectDto,
    @User() user: AuthUser,
  ): Promise<ApiResponse<ProjectResponseDto>> {
    return this.projectsService.create(createProjectDto, user.role);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @User() user: AuthUser,
  ): Promise<ApiResponse<ProjectResponseDto[]>> {
    return this.projectsService.findAll(user.role, user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: AuthUser,
  ): Promise<ApiResponse<ProjectResponseDto>> {
    const project = await this.projectsService.findOne(id, user.role, user.id);
    return {
      success: true,
      message: 'Project retrieved successfully',
      data: project,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateProjectDto: UpdateProjectDto,
    @User() user: AuthUser,
  ): Promise<ApiResponse<ProjectResponseDto>> {
    return this.projectsService.update(
      id,
      updateProjectDto,
      user.role,
      user.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: AuthUser,
  ): Promise<ApiResponse<null>> {
    return this.projectsService.remove(id, user.role);
  }
}
