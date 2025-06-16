import { ProjectStatus, EmailStatus } from '@prisma/client';

export class ProjectResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  startDate!: Date;
  endDate!: Date;
  status!: ProjectStatus;
  emailStatus!: EmailStatus;
  assigneeId!: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
