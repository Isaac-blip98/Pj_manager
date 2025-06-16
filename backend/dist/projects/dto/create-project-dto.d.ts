import { ProjectStatus } from '../interfaces/project.interface';
export declare class CreateProjectDto {
    name: string;
    description?: string;
    endDate: Date;
    assigneeId?: string;
    status?: ProjectStatus;
}
