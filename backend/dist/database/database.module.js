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
var DatabaseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DatabaseModule = DatabaseModule_1 = class DatabaseModule {
    prisma;
    logger = new common_1.Logger(DatabaseModule_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            const adminExists = await this.prisma.user.findFirst({
                where: {
                    email: 'markndwiga@gmail.com',
                    role: client_1.UserRole.ADMIN,
                },
                include: {
                    assignedProject: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            if (!adminExists) {
                this.logger.error('Admin user not properly configured');
                process.exit(1);
            }
            this.logger.log('Database initialization completed successfully');
        }
        catch (error) {
            this.logger.error('Failed to verify database setup');
            this.logger.error(error);
            process.exit(1);
        }
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = DatabaseModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DatabaseModule);
//# sourceMappingURL=database.module.js.map