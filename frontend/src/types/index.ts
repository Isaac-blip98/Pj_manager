export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  profileImage?: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  assignee?: User;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}