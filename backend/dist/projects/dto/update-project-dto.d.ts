import { ProjectStatus } from '../interfaces/project.interface';
export declare class UpdateProjectDto {
    name?: string;
    description?: string;
    endDate?: Date;
    assigneeId?: string;
    status?: ProjectStatus;
    isActive?: boolean;
}
