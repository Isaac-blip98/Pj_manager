"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
let ProjectsService = class ProjectsService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async create(createProjectDto, userRole) {
        if (userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can create projects');
        }
        try {
            const existingProject = await this.prisma.project.findFirst({
                where: { name: createProjectDto.name },
            });
            if (existingProject) {
                throw new common_1.ConflictException('A project with this name already exists');
            }
            const project = await this.prisma.project.create({
                data: {
                    name: createProjectDto.name,
                    description: createProjectDto.description,
                    endDate: createProjectDto.endDate,
                    status: client_1.ProjectStatus.PENDING,
                    emailStatus: client_1.EmailStatus.NOT_SENT,
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
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create project');
        }
    }
    async getUserProject(userId) {
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
    async markAsCompleted(projectId) {
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
    async findAll(userRole, userId) {
        try {
            const whereClause = userRole === client_1.UserRole.USER
                ? {
                    OR: [
                        { assigneeId: userId },
                        {
                            AND: [
                                { status: client_1.ProjectStatus.COMPLETED },
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
            if (userRole === client_1.UserRole.USER) {
                const assignedProject = projects.find((p) => p.assigneeId === userId);
                const message = assignedProject
                    ? `You have an ${assignedProject.status.toLowerCase()} project`
                    : 'You can take on a new project';
                return {
                    success: true,
                    message,
                    data: projects,
                };
            }
            return {
                success: true,
                message: 'Projects retrieved successfully',
                data: projects,
            };
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Failed to retrieve projects: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findOne(id, userRole, userId) {
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
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        if (userRole === client_1.UserRole.USER && project.assigneeId !== userId) {
            throw new common_1.ForbiddenException('You can only view your assigned projects');
        }
        return project;
    }
    async update(id, updateProjectDto, userRole, userId) {
        const project = await this.findOne(id, userRole, userId);
        if (userRole === client_1.UserRole.USER && project.assigneeId !== userId) {
            throw new common_1.ForbiddenException('You can only update your assigned projects');
        }
        try {
            if (updateProjectDto.status) {
                if (updateProjectDto.status === client_1.ProjectStatus.IN_PROGRESS) {
                    if (project.status === client_1.ProjectStatus.IN_PROGRESS) {
                        throw new common_1.ConflictException('Project is already in progress');
                    }
                    if (project.status === client_1.ProjectStatus.COMPLETED) {
                        throw new common_1.ConflictException('Cannot set completed project to in progress');
                    }
                }
                if (updateProjectDto.status === client_1.ProjectStatus.COMPLETED) {
                    if (project.status === client_1.ProjectStatus.COMPLETED) {
                        throw new common_1.ConflictException('Project is already marked as completed');
                    }
                    if (project.status === client_1.ProjectStatus.PENDING) {
                        throw new common_1.ConflictException('Project must be in progress before completion');
                    }
                    await this.emailService.sendProjectCompletionEmail(project.name, project.assignee?.name ?? 'Unknown');
                }
            }
            if (updateProjectDto.assigneeId) {
                if (userRole !== client_1.UserRole.ADMIN) {
                    throw new common_1.ForbiddenException('Only admins can assign projects');
                }
                if (project.assigneeId) {
                    throw new common_1.ConflictException('Project has already been assigned');
                }
                const existingAssignment = await this.prisma.project.findFirst({
                    where: {
                        assigneeId: updateProjectDto.assigneeId,
                        status: { not: client_1.ProjectStatus.COMPLETED },
                    },
                });
                if (existingAssignment) {
                    throw new common_1.ConflictException('User already has an active project. Must complete current project first.');
                }
                const assignee = await this.prisma.user.findUnique({
                    where: { id: updateProjectDto.assigneeId },
                    select: {
                        email: true,
                        name: true,
                    },
                });
                if (!assignee) {
                    throw new common_1.NotFoundException('Assignee not found');
                }
                const emailSent = await this.emailService.sendProjectAssignmentEmail(assignee, project.name);
                const updatedProject = await this.prisma.project.update({
                    where: { id },
                    data: {
                        ...updateProjectDto,
                        emailStatus: emailSent ? client_1.EmailStatus.SENT : client_1.EmailStatus.NOT_SENT,
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
                    message: `Project assigned successfully${!emailSent ? ' (email notification failed)' : ''}`,
                    data: updatedProject,
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
                data: updatedProject,
            };
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException ||
                error instanceof common_1.ConflictException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update project');
        }
    }
    async remove(id, userRole) {
        if (userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can delete projects');
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
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        if (project.assigneeId && project.status !== client_1.ProjectStatus.COMPLETED) {
            throw new common_1.ForbiddenException('Cannot delete assigned project before completion');
        }
        try {
            await this.prisma.project.delete({ where: { id } });
            return {
                success: true,
                message: `Project "${project.name}" (ID: ${project.id}) has been deleted successfully`,
                data: null,
            };
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Failed to delete project: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map