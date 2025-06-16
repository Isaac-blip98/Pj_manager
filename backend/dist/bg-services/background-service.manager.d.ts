import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EmailBackgroundService } from './email.background.service';
import { ProjectStatusBackgroundService } from './project-status.background.service';
export declare class BackgroundServiceManager implements OnModuleInit, OnModuleDestroy {
    private readonly emailService;
    private readonly projectStatusService;
    constructor(emailService: EmailBackgroundService, projectStatusService: ProjectStatusBackgroundService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private startAll;
    private stopAll;
}
