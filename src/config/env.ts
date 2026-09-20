import "dotenv/config";

export const env = {
    port: Number(process.env.PORT) || 5000,
    databaseUrl: process.env.DATABASE_URL!,
    redisUrl: process.env.REDIS_URL!,    
    stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
};