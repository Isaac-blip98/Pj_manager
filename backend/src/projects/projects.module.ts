import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService, EmailService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
