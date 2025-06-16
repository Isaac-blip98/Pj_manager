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
exports.BackgroundServiceManager = void 0;
const common_1 = require("@nestjs/common");
const email_background_service_1 = require("./email.background.service");
const project_status_background_service_1 = require("./project-status.background.service");
let BackgroundServiceManager = class BackgroundServiceManager {
    emailService;
    projectStatusService;
    constructor(emailService, projectStatusService) {
        this.emailService = emailService;
        this.projectStatusService = projectStatusService;
    }
    async onModuleInit() {
        await this.startAll();
    }
    async onModuleDestroy() {
        await this.stopAll();
    }
    async startAll() {
        await Promise.all([
            this.emailService.start(),
            this.projectStatusService.start(),
        ]);
    }
    async stopAll() {
        await Promise.all([
            this.emailService.stop(),
            this.projectStatusService.stop(),
        ]);
    }
};
exports.BackgroundServiceManager = BackgroundServiceManager;
exports.BackgroundServiceManager = BackgroundServiceManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_background_service_1.EmailBackgroundService,
        project_status_background_service_1.ProjectStatusBackgroundService])
], BackgroundServiceManager);
//# sourceMappingURL=background-service.manager.js.map