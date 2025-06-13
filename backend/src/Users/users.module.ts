import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../shared/utils/cloudinary/cloudinary.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, CloudinaryService],
  exports: [UsersService],
})
export class UsersModule {}
