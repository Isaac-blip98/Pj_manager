import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { loginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { AuthReponse } from './Interface/auth.interface';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: loginDto): Promise<ApiResponse<AuthReponse>>;
    register(registerDto: RegisterDto): Promise<ApiResponse<AuthReponse>>;
}
