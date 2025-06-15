import { Project, User } from '@prisma/client';
export interface ProjectWithAssignee extends Project {
    assignee: User | null;
}
export interface EmailQueueItem {
    id: string;
    to: string;
    subject: string;
    template: string;
    context: string;
}
export interface EmailContext {
    projectName: string;
    endDate: string;
    updatedAt?: string;
}
