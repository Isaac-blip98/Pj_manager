import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { loginDto } from './dtos/login.dto';
import { ApiResponse, AuthReponse } from './Interface/auth.interface';
import { AuthService } from './auth.service';
import { UserResponseDto } from 'src/Users/dtos/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: loginDto): Promise<ApiResponse<AuthReponse>> {
    return this.AuthService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.AuthService.register(registerDto);
  }
}
