"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProjectStatusBackgroundService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectStatusBackgroundService = void 0;
const common_1 = require("@nestjs/common");
const base_background_service_1 = require("./base.background.service");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const config_1 = require("@nestjs/config");
const date_fns_1 = require("date-fns");
const client_1 = require("@prisma/client");
let ProjectStatusBackgroundService = ProjectStatusBackgroundService_1 = class ProjectStatusBackgroundService extends base_background_service_1.BaseBackgroundService {
    prisma;
    emailService;
    configService;
    isRunning = false;
    checkInterval = null;
    DEADLINE_WARNING_HOURS = 24;
    STALE_DAYS = 7;
    logger = new common_1.Logger(ProjectStatusBackgroundService_1.name);
    constructor(prisma, emailService, configService) {
        super('ProjectStatusBackgroundService');
        this.prisma = prisma;
        this.emailService = emailService;
        this.configService = configService;
    }
    async start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.logger.log('ProjectStatusBackgroundService started');
        await this.checkProjects();
        this.checkInterval = setInterval(() => {
            void this.checkProjects().catch((err) => {
                this.logger.error('Error checking projects:', err);
            });
        }, 60 * 60 * 1000);
    }
    async stop() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        await this.checkProjects();
        this.logger.log('ProjectStatusBackgroundService stopped');
    }
    async checkProjects() {
        const now = new Date();
        await Promise.all([
            this.checkDeadlineProjects(now),
            this.checkStaleProjects(now),
        ]);
    }
    async checkDeadlineProjects(now) {
        const deadlineProjects = await this.prisma.project.findMany({
            where: {
                endDate: {
                    gte: now,
                    lte: (0, date_fns_1.addDays)(now, 1),
                },
                status: client_1.ProjectStatus.IN_PROGRESS,
                emailStatus: client_1.EmailStatus.NOT_SENT,
                isActive: true,
            },
            include: { assignee: true },
        });
        for (const project of deadlineProjects) {
            if ((0, date_fns_1.differenceInHours)(project.endDate, now) <= this.DEADLINE_WARNING_HOURS) {
                await this.sendDeadlineWarning(project);
            }
        }
    }
    async checkStaleProjects(now) {
        const staleProjects = await this.prisma.project.findMany({
            where: {
                updatedAt: {
                    lte: (0, date_fns_1.subDays)(now, this.STALE_DAYS),
                },
                status: client_1.ProjectStatus.IN_PROGRESS,
                emailStatus: client_1.EmailStatus.NOT_SENT,
                isActive: true,
            },
            include: { assignee: true },
        });
        for (const project of staleProjects) {
            await this.sendStaleWarning(project);
        }
    }
    async sendDeadlineWarning(project) {
        if (!project.assignee)
            return;
        await this.emailService.sendMail({
            to: project.assignee.email,
            subject: `Project "${project.name}" deadline approaching`,
            template: 'deadline-warning',
            context: {
                projectName: project.name,
                endDate: project.endDate.toISOString(),
            },
        });
        await this.prisma.project.update({
            where: { id: project.id },
            data: { emailStatus: client_1.EmailStatus.SENT },
        });
        this.logger.log(`Deadline warning sent for project ${project.name}`);
    }
    async sendStaleWarning(project) {
        if (!project.assignee)
            return;
        await this.emailService.sendMail({
            to: project.assignee.email,
            subject: `Project "${project.name}" is stale`,
            template: 'stale-warning',
            context: {
                projectName: project.name,
                endDate: project.endDate.toISOString(),
                updatedAt: project.updatedAt.toISOString(),
            },
        });
        await this.prisma.project.update({
            where: { id: project.id },
            data: { emailStatus: client_1.EmailStatus.SENT },
        });
        this.logger.log(`Stale warning sent for project ${project.name}`);
    }
};
exports.ProjectStatusBackgroundService = ProjectStatusBackgroundService;
exports.ProjectStatusBackgroundService = ProjectStatusBackgroundService = ProjectStatusBackgroundService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService])
], ProjectStatusBackgroundService);
//# sourceMappingURL=project-status.background.service.js.map