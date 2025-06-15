"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundServiceManager = void 0;
const common_1 = require("@nestjs/common");
const email_background_service_1 = require("@backend/bg-services/email.background.service");
const project_status_background_service_1 = require("@backend/bg-services/project-status.background.service");
class BackgroundServiceManager {
    constructor(configService, prisma, emailService) {
        this.logger = new common_1.Logger('BackgroundServiceManager');
        this.services = [
            new email_background_service_1.EmailBackgroundService(emailService, prisma),
            new project_status_background_service_1.ProjectStatusBackgroundService(prisma, emailService, configService)
        ];
    }
    async startAll() {
        this.logger.log('Starting all background services...');
        for (const service of this.services) {
            try {
                await service.start();
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Failed to start service: ${service.constructor.name}`, errorMessage);
            }
        }
    }
    async stopAll() {
        this.logger.log('Stopping all background services...');
        for (const service of this.services) {
            try {
                await service.stop();
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Failed to stop service: ${service.constructor.name}`, errorMessage);
            }
        }
    }
}
exports.BackgroundServiceManager = BackgroundServiceManager;
//# sourceMappingURL=service-manager.js.map