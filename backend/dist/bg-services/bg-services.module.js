"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundServicesModule = void 0;
const common_1 = require("@nestjs/common");
const email_background_service_1 = require("./email.background.service");
const project_status_background_service_1 = require("./project-status.background.service");
const background_service_manager_1 = require("./background-service.manager");
const email_module_1 = require("../email/email.module");
const prisma_module_1 = require("../prisma/prisma.module");
let BackgroundServicesModule = class BackgroundServicesModule {
};
exports.BackgroundServicesModule = BackgroundServicesModule;
exports.BackgroundServicesModule = BackgroundServicesModule = __decorate([
    (0, common_1.Module)({
        imports: [email_module_1.EmailModule, prisma_module_1.PrismaModule],
        providers: [
            email_background_service_1.EmailBackgroundService,
            project_status_background_service_1.ProjectStatusBackgroundService,
            background_service_manager_1.BackgroundServiceManager,
        ],
        exports: [background_service_manager_1.BackgroundServiceManager],
    })
], BackgroundServicesModule);
//# sourceMappingURL=bg-services.module.js.map