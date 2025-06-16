"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const cloudinary_service_1 = require("../shared/utils/cloudinary/cloudinary.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    sanitizeUser(user) {
        const { password, ...rest } = user;
        return rest;
    }
    async create(data) {
        if (!data.password) {
            throw new common_1.BadRequestException('Password is required');
        }
        if (data.password.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters long');
        }
        if (data.role && !Object.values(client_1.UserRole).includes(data.role)) {
            throw new common_1.BadRequestException('Invalid role provided');
        }
        const hashedPassword = await bcrypt.hash(data.password, 12);
        try {
            const user = await this.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: data.role ?? client_1.UserRole.USER,
                },
            });
            return {
                success: true,
                message: 'User created successfully',
                data: this.sanitizeUser(user),
            };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new common_1.BadRequestException('Email already exists');
                }
            }
            throw new common_1.BadRequestException('Failed to create user');
        }
    }
    async findAll(options = {}) {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: { isActive: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where: { isActive: true } }),
        ]);
        return {
            success: true,
            message: 'Users retrieved successfully',
            data: users.map((user) => this.sanitizeUser(user)),
        };
    }
    async findActive(options = {}) {
        return this.findAll(options);
    }
    async findByRole(role, options = {}) {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    isActive: true,
                    role,
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({
                where: {
                    isActive: true,
                    role,
                },
            }),
        ]);
        return {
            success: true,
            message: 'Users retrieved successfully',
            data: users.map((user) => this.sanitizeUser(user)),
        };
    }
    async findOne(id) {
        if (!id) {
            throw new common_1.BadRequestException('User ID is required');
        }
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user || !user.isActive) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            success: true,
            message: 'User retrieved successfully',
            data: this.sanitizeUser(user),
        };
    }
    async getById(id) {
        return this.findOne(id);
    }
    async findByEmail(email) {
        if (!email) {
            throw new common_1.BadRequestException('Email is required');
        }
        const user = await this.prisma.user.findUnique({
            where: { email, isActive: true },
        });
        return user ? this.sanitizeUser(user) : null;
    }
    async update(id, data) {
        if (!id) {
            throw new common_1.BadRequestException('User ID is required');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser || !existingUser.isActive) {
            throw new common_1.NotFoundException('User not found');
        }
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.email)
            updateData.email = data.email;
        if (data.password) {
            if (data.password.length < 8) {
                throw new common_1.BadRequestException('Password must be at least 8 characters long');
            }
            updateData.password = await bcrypt.hash(data.password, 12);
        }
        if (data.role && !Object.values(client_1.UserRole).includes(data.role)) {
            throw new common_1.BadRequestException('Invalid role');
        }
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: updateData,
            });
            return {
                success: true,
                message: 'User updated successfully',
                data: this.sanitizeUser(updatedUser),
            };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new common_1.BadRequestException('Email already exists');
                }
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException('User not found');
                }
            }
            throw new common_1.BadRequestException('Failed to update user');
        }
    }
    async remove(id) {
        if (!id) {
            throw new common_1.BadRequestException('User ID is required');
        }
        try {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            await this.prisma.user.update({
                where: { id },
                data: { isActive: false },
            });
            return {
                success: true,
                message: 'User deactivated successfully',
                data: { message: 'User deactivated successfully' },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to deactivate user');
        }
    }
    async login(credentials) {
        const { email, password } = credentials;
        if (!email || !password) {
            throw new common_1.BadRequestException('Email and password are required');
        }
        const user = await this.prisma.user.findUnique({
            where: { email, isActive: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return {
            success: true,
            message: 'Login successful',
            data: this.sanitizeUser(user),
        };
    }
    async uploadProfileImage(id, file) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user || !user.isActive) {
            throw new common_1.NotFoundException('User not found');
        }
        try {
            const uploaded = await this.cloudinaryService.upload(file);
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: { profileImage: uploaded.secure_url },
            });
            return {
                success: true,
                message: 'Profile image uploaded successfully',
                data: this.sanitizeUser(updatedUser),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to upload profile image');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], UsersService);
//# sourceMappingURL=users.service.js.map