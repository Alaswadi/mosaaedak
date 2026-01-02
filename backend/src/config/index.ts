import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    // Server
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    databaseUrl: process.env.DATABASE_URL!,

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

    // JWT
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // n8n
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL!,

    // File Upload
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB

    // Billing
    costPerMessage: parseFloat(process.env.COST_PER_MESSAGE || '0.03'),
    monthlySubscriptionFee: parseFloat(process.env.MONTHLY_SUBSCRIPTION_FEE || '29.00'),
    lowBalanceThreshold: parseFloat(process.env.LOW_BALANCE_THRESHOLD || '1.00'),

    // Twilio (Master Account)
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,

    // Encryption
    encryptionKey: process.env.ENCRYPTION_KEY!,
} as const;

// Validate required environment variables
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'N8N_WEBHOOK_URL'];

export function validateConfig(): void {
    const missing = requiredVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
