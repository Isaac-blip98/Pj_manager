import { ConfigService } from '@nestjs/config';
import { JwtPayLoad } from './Interface/auth.interface';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(payload: JwtPayLoad): Promise<{
        userId: string;
        email: string;
        role: string;
    }>;
}
export {};
