import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@backend/prisma/prisma.service';
import { EmailService } from '@backend/email/email.service';
export declare class BackgroundServiceManager {
    private readonly logger;
    private readonly services;
    constructor(configService: ConfigService, prisma: PrismaService, emailService: EmailService);
    startAll(): Promise<void>;
    stopAll(): Promise<void>;
}
