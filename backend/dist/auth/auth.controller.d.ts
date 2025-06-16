import { RegisterDto } from './dtos/register.dto';
import { loginDto } from './dtos/login.dto';
import { ApiResponse, AuthReponse } from './Interface/auth.interface';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly AuthService;
    constructor(AuthService: AuthService);
    login(loginDto: loginDto): Promise<ApiResponse<AuthReponse>>;
    register(registerDto: RegisterDto): Promise<ApiResponse<AuthReponse>>;
}
