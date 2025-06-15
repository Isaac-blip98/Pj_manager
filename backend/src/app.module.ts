import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './Users/users.module';

@Module({
  imports: [UsersModule, PrismaModule, DatabaseModule, AuthModule,  ConfigModule.forRoot({isGlobal: true,})],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
