import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { ProjectStatus } from '../interfaces/project.interface';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsString()
  @IsOptional()
  status?: ProjectStatus;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
