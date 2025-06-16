import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateProjectDto } from './dto/create-project-dto';
import { UpdateProjectDto } from './dto/update-project-dto';
import { ProjectResponseDto } from './dto/project-response-dto';
import { UserRole, Project } from '@prisma/client';
import { ApiResponse } from '../common/interfaces/api-response.interface';
export declare class ProjectsService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    create(createProjectDto: CreateProjectDto, userRole: UserRole): Promise<ApiResponse<ProjectResponseDto>>;
    getUserProject(userId: string): Promise<ApiResponse<Project | null>>;
    markAsCompleted(projectId: string): Promise<ApiResponse<Project>>;
    findAll(userRole: UserRole, userId: string): Promise<ApiResponse<ProjectResponseDto[]>>;
    findOne(id: string, userRole: UserRole, userId: string): Promise<ProjectResponseDto>;
    update(id: string, updateProjectDto: UpdateProjectDto, userRole: UserRole, userId: string): Promise<ApiResponse<ProjectResponseDto>>;
    remove(id: string, userRole: UserRole): Promise<ApiResponse<null>>;
}
