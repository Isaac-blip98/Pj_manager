"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("@backend/prisma/prisma.service");
const email_service_1 = require("@backend/email/email.service");
const service_manager_1 = require("./service-manager");
const mailer_1 = require("@nestjs-modules/mailer");
const nodemailer_1 = require("nodemailer");
async function bootstrap() {
    const prisma = new prisma_service_1.PrismaService();
    const configService = new config_1.ConfigService();
    const mailerConfig = {
        host: configService.get('MAIL_HOST'),
        port: configService.get('MAIL_PORT'),
        user: configService.get('MAIL_USER'),
        pass: configService.get('MAIL_PASS'),
    };
    if (!mailerConfig.host || !mailerConfig.port || !mailerConfig.user || !mailerConfig.pass) {
        throw new Error('Mailer configuration is incomplete. Please check your environment variables.');
    }
    const transporter = (0, nodemailer_1.createTransport)({
        host: mailerConfig.host,
        port: mailerConfig.port,
        auth: {
            user: mailerConfig.user,
            pass: mailerConfig.pass,
        },
    });
    const mailerService = new mailer_1.MailerService({ transporter, defaults: { from: mailerConfig.user } }, null);
    const emailService = new email_service_1.EmailService(mailerService);
    const serviceManager = new service_manager_1.BackgroundServiceManager(configService, prisma, emailService);
    process.on('SIGTERM', async () => {
        console.log('SIGTERM received. Shutting down background services...');
        await serviceManager.stopAll();
        process.exit(0);
    });
    process.on('SIGINT', async () => {
        console.log('SIGINT received. Shutting down background services...');
        await serviceManager.stopAll();
        process.exit(0);
    });
    await serviceManager.startAll();
}
bootstrap().catch(err => {
    console.error('Failed to start background services:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map