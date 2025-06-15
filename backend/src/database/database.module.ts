import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      // Verify admin user setup
      const adminExists = await this.prisma.user.findFirst({
        where: {
          email: 'markndwiga@gmail.com',
          role: UserRole.ADMIN,
        },
        include: {
          assignedProject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!adminExists) {
        this.logger.error('Admin user not properly configured');
        process.exit(1);
      }

      this.logger.log('Database initialization completed successfully');
    } catch (error) {
      this.logger.error('Failed to verify database setup');
      this.logger.error(error);
      process.exit(1);
    }
  }
}
