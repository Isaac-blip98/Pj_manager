import { Logger } from '@nestjs/common';
import { BaseBackgroundService } from './base.background.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
export declare class ProjectStatusBackgroundService extends BaseBackgroundService {
    private readonly prisma;
    private readonly emailService;
    private readonly configService;
    private isRunning;
    private checkInterval;
    private readonly DEADLINE_WARNING_HOURS;
    private readonly STALE_DAYS;
    protected readonly logger: Logger;
    constructor(prisma: PrismaService, emailService: EmailService, configService: ConfigService);
    start(): Promise<void>;
    stop(): Promise<void>;
    private checkProjects;
    private checkDeadlineProjects;
    private checkStaleProjects;
    private sendDeadlineWarning;
    private sendStaleWarning;
}
