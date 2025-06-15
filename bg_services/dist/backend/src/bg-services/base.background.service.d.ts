import { Logger } from '@nestjs/common';
export declare abstract class BaseBackgroundService {
    protected readonly logger: Logger;
    constructor(serviceName: string);
    abstract start(): Promise<void>;
    abstract stop(): Promise<void>;
}
