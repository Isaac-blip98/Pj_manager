import { ProjectStatus } from '@prisma/client';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  assigneeId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export { ProjectStatus };
