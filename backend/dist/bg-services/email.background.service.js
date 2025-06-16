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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailBackgroundService = void 0;
const common_1 = require("@nestjs/common");
const base_background_service_1 = require("./base.background.service");
const email_service_1 = require("../email/email.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let EmailBackgroundService = class EmailBackgroundService extends base_background_service_1.BaseBackgroundService {
    emailService;
    prisma;
    isRunning = false;
    processInterval = null;
    batchSize = 10;
    processingInterval = 60000;
    constructor(emailService, prisma) {
        super('EmailBackgroundService');
        this.emailService = emailService;
        this.prisma = prisma;
    }
    async start() {
        if (this.isRunning) {
            this.logger.warn('Email service is already running');
            return;
        }
        this.isRunning = true;
        await this.processEmailQueue();
        this.processInterval = setInterval(() => {
            void this.processEmailQueue().catch((err) => {
                this.logger.error('Error processing email queue:', err);
            });
        }, this.processingInterval);
        this.logger.log('Email background service started');
    }
    async processEmailQueue() {
        try {
            await this.prisma.emailQueue.updateMany({
                where: { status: client_1.EmailStatus.NOT_SENT },
                data: { status: client_1.EmailStatus.PENDING },
            });
            const pendingEmails = await this.prisma.emailQueue.findMany({
                where: {
                    status: client_1.EmailStatus.PENDING,
                    retries: {
                        lt: 3,
                    },
                },
                take: this.batchSize,
                orderBy: { createdAt: 'asc' },
            });
            if (pendingEmails.length === 0)
                return;
            this.logger.log(`Processing ${pendingEmails.length} pending emails`);
            for (const email of pendingEmails) {
                try {
                    await this.updateEmailStatus(email.id, client_1.EmailStatus.PROCESSING);
                    const parsedContext = this.parseEmailContext(email.context);
                    const emailOptions = this.createEmailOptions(email, parsedContext);
                    await this.emailService.sendMail(emailOptions);
                    await this.updateEmailStatus(email.id, client_1.EmailStatus.SENT);
                    this.logger.log(`Successfully sent email ${email.id} to ${email.to}`);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    await this.updateEmailStatus(email.id, client_1.EmailStatus.FAILED, errorMessage);
                    await this.prisma.emailQueue.update({
                        where: { id: email.id },
                        data: { retries: { increment: 1 } },
                    });
                    this.logger.error(`Failed to send email ${email.id}:`, errorMessage);
                }
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to process email queue:', errorMessage);
        }
    }
    parseEmailContext(contextString) {
        try {
            const parsedContext = JSON.parse(contextString);
            if (!parsedContext.projectName || !parsedContext.endDate) {
                throw new Error('Missing required fields in email context');
            }
            return parsedContext;
        }
        catch (error) {
            throw new Error(`Invalid email context: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    createEmailOptions(email, context) {
        return {
            to: email.to,
            subject: email.subject,
            template: email.template,
            context: {
                projectName: context.projectName,
                endDate: context.endDate,
                updatedAt: context.updatedAt,
                userName: context.userName,
                projectUrl: context.projectUrl,
                message: context.message,
            },
        };
    }
    async updateEmailStatus(id, status, error) {
        await this.prisma.emailQueue.update({
            where: { id },
            data: {
                status,
                error: error || null,
                processedAt: status === client_1.EmailStatus.SENT ? new Date() : undefined,
            },
        });
    }
    async stop() {
        if (!this.isRunning)
            return;
        if (this.processInterval) {
            clearInterval(this.processInterval);
            this.processInterval = null;
        }
        await this.processEmailQueue();
        this.isRunning = false;
        this.logger.log('Email background service stopped');
    }
};
exports.EmailBackgroundService = EmailBackgroundService;
exports.EmailBackgroundService = EmailBackgroundService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        prisma_service_1.PrismaService])
], EmailBackgroundService);
//# sourceMappingURL=email.background.service.js.map