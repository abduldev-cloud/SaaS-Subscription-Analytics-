import "dotenv/config";

export const env = {
    port: Number(process.env.PORT) || 5000,
    databaseUrl: process.env.DATABASE_URL!,
    redisUrl: process.env.REDIS_URL!,    
    stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    mailtrapHost: process.env.MAILTRAP_HOST!,
    mailtrapPort: Number(process.env.MAILTRAP_PORT) || 2525,
    mailtrapUser: process.env.MAILTRAP_USER!,
    mailtrapPass: process.env.MAILTRAP_PASS!,
    mailFrom: process.env.MAIL_FROM!,
};