import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateProjectDto } from './dto/create-project-dto';
import { UpdateProjectDto } from './dto/update-project-dto';
import { ProjectResponseDto } from './dto/project-response-dto';
import { UserRole, ProjectStatus, EmailStatus, Project } from '@prisma/client';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userRole: UserRole,
  ): Promise<ApiResponse<ProjectResponseDto>> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create projects');
    }

    try {
      const existingProject = await this.prisma.project.findFirst({
        where: { name: createProjectDto.name },
      });

      if (existingProject) {
        throw new ConflictException('A project with this name already exists');
      }

      const project = await this.prisma.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          startDate: new Date(),
          endDate: createProjectDto.endDate,
          status: ProjectStatus.IN_PROGRESS,
          emailStatus: EmailStatus.NOT_SENT,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Project created successfully',
        data: project,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async getUserProject(userId: string): Promise<ApiResponse<Project | null>> {
    const project = await this.prisma.project.findFirst({
      where: { assigneeId: userId },
    });

    return {
      success: true,
      message: project
        ? 'Project retrieved successfully'
        : 'No project assigned',
      data: project,
    };
  }

  async markAsCompleted(projectId: string): Promise<ApiResponse<Project>> {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' },
    });

    return {
      success: true,
      message: 'Project marked as completed',
      data: project,
    };
  }

  async findAll(
    userRole: UserRole,
    userId: string,
  ): Promise<ApiResponse<ProjectResponseDto[]>> {
    try {
      const whereClause =
        userRole === UserRole.USER
          ? {
              OR: [
                { assigneeId: userId },
                {
                  AND: [
                    { status: ProjectStatus.COMPLETED },
                    { assigneeId: null },
                  ],
                },
              ],
            }
          : {};

      const projects = await this.prisma.project.findMany({
        where: whereClause,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (userRole === UserRole.USER) {
        const assignedProject = projects.find((p) => p.assigneeId === userId);
        const message = assignedProject
          ? `You have an ${assignedProject.status.toLowerCase()} project`
          : 'You can take on a new project';

        return {
          success: true,
          message,
          data: projects as ProjectResponseDto[],
        };
      }

      return {
        success: true,
        message: 'Projects retrieved successfully',
        data: projects as ProjectResponseDto[],
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to retrieve projects: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findOne(
    id: string,
    userRole: UserRole,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (userRole === UserRole.USER && project.assigneeId !== userId) {
      throw new ForbiddenException('You can only view your assigned projects');
    }

    return project as ProjectResponseDto;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userRole: UserRole,
    userId: string,
  ): Promise<ApiResponse<ProjectResponseDto>> {
    const project = await this.findOne(id, userRole, userId);

    if (userRole === UserRole.USER && project.assigneeId !== userId) {
      throw new ForbiddenException(
        'You can only update your assigned projects',
      );
    }

    try {
      if (updateProjectDto.status) {
        if (updateProjectDto.status === ProjectStatus.IN_PROGRESS) {
          if (project.status === ProjectStatus.IN_PROGRESS) {
            throw new ConflictException('Project is already in progress');
          }
          if (project.status === ProjectStatus.COMPLETED) {
            throw new ConflictException(
              'Cannot set completed project to in progress',
            );
          }
        }

        if (updateProjectDto.status === ProjectStatus.COMPLETED) {
          if (project.status === ProjectStatus.COMPLETED) {
            throw new ConflictException(
              'Project is already marked as completed',
            );
          }
          if (project.status === ProjectStatus.ON_HOLD) {
            throw new ConflictException(
              'Project must be in progress before completion',
            );
          }

          await this.emailService.sendProjectCompletionEmail(
            project.name,
            project.assignee?.name ?? 'Unknown',
          );
        }
      }

      if (updateProjectDto.assigneeId) {
        if (userRole !== UserRole.ADMIN) {
          throw new ForbiddenException('Only admins can assign projects');
        }

        if (project.assigneeId) {
          throw new ConflictException('Project has already been assigned');
        }

        const existingAssignment = await this.prisma.project.findFirst({
          where: {
            assigneeId: updateProjectDto.assigneeId,
            status: { not: ProjectStatus.COMPLETED },
          },
        });

        if (existingAssignment) {
          throw new ConflictException(
            'User already has an active project. Must complete current project first.',
          );
        }

        const assignee = await this.prisma.user.findUnique({
          where: { id: updateProjectDto.assigneeId },
          select: {
            email: true,
            name: true,
          },
        });

        if (!assignee) {
          throw new NotFoundException('Assignee not found');
        }

        const emailSent = await this.emailService.sendProjectAssignmentEmail(
          assignee,
          project.name,
        );

        const updatedProject = await this.prisma.project.update({
          where: { id },
          data: {
            ...updateProjectDto,
            emailStatus: emailSent ? EmailStatus.SENT : EmailStatus.NOT_SENT,
          },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return {
          success: true,
          message: `Project assigned successfully${
            !emailSent ? ' (email notification failed)' : ''
          }`,
          data: updatedProject as ProjectResponseDto,
        };
      }

      const updatedProject = await this.prisma.project.update({
        where: { id },
        data: updateProjectDto,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Project updated successfully',
        data: updatedProject as ProjectResponseDto,
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  async remove(id: string, userRole: UserRole): Promise<ApiResponse<null>> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete projects');
    }

    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        assigneeId: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (project.assigneeId && project.status !== ProjectStatus.COMPLETED) {
      throw new ForbiddenException(
        'Cannot delete assigned project before completion',
      );
    }

    try {
      await this.prisma.project.delete({ where: { id } });
      return {
        success: true,
        message: `Project "${project.name}" (ID: ${project.id}) has been deleted successfully`,
        data: null,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete project: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
