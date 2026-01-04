import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, validateConfig } from './config/index.js';
import { getRedis } from './config/redis.js';
import prisma from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
validateConfig();

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:9000', // New Frontend Port
    'http://localhost:9002', // New Backend Port (just in case)
    'http://localhost:5173', // Vite local dev
    'http://localhost:4173', // Vite preview
    'http://localhost:3000', // Alternative local port
    'http://localhost',      // Docker/Coolify local
].filter((origin): origin is string => !!origin);

app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`Blocked CORS request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded proofs (served to admins only via authenticated routes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply general rate limiting
app.use('/api', apiLimiter);

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected');

        // Test Redis connection
        const redis = getRedis();
        await redis.connect();
        console.log('✅ Redis connected');

        // Start listening
        app.listen(config.port, () => {
            console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║   🚀 Mosaaedak API Gateway                   ║
║                                              ║
║   Server:  http://localhost:${config.port}            ║
║   Mode:    ${config.nodeEnv.padEnd(30)}║
║   n8n:     ${config.n8nWebhookUrl.substring(0, 28).padEnd(30)}║
║                                              ║
╚══════════════════════════════════════════════╝
      `);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down gracefully...');
    await prisma.$disconnect();
    const redis = getRedis();
    await redis.quit();
    process.exit(0);
});

start();

export default app;
