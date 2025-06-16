import { BaseBackgroundService } from './base.background.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class EmailBackgroundService extends BaseBackgroundService {
    private readonly emailService;
    private readonly prisma;
    private isRunning;
    private processInterval;
    private readonly batchSize;
    private readonly processingInterval;
    constructor(emailService: EmailService, prisma: PrismaService);
    start(): Promise<void>;
    private processEmailQueue;
    private parseEmailContext;
    private createEmailOptions;
    private updateEmailStatus;
    stop(): Promise<void>;
}
