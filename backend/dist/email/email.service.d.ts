import { MailerService } from '@nestjs-modules/mailer';
import { EmailOptions } from './interfaces/email.interface';
export declare class EmailService {
    private mailerService;
    private readonly logger;
    constructor(mailerService: MailerService);
    sendMail(options: EmailOptions): Promise<void>;
    sendProjectAssignmentEmail(assignee: {
        email: string;
        name: string;
    }, projectName: string): Promise<boolean>;
    sendProjectCompletionEmail(projectName: string, userName: string): Promise<boolean>;
}
