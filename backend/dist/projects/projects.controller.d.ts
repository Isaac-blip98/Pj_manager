import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project-dto';
import { UpdateProjectDto } from './dto/update-project-dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { ProjectResponseDto } from './dto/project-response-dto';
import { Project } from '@prisma/client';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, user: AuthUser): Promise<ApiResponse<ProjectResponseDto>>;
    findAll(user: AuthUser): Promise<ApiResponse<ProjectResponseDto[]>>;
    getUserProject(userId: string): Promise<ApiResponse<Project | null>>;
    markProjectCompleted(id: string): Promise<ApiResponse<Project>>;
    findOne(id: string, user: AuthUser): Promise<ApiResponse<ProjectResponseDto>>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: AuthUser): Promise<ApiResponse<ProjectResponseDto>>;
    remove(id: string, user: AuthUser): Promise<ApiResponse<null>>;
}
