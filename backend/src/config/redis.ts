import { Redis } from 'ioredis';
import { config } from './index.js';

// Redis client singleton
let redis: Redis | null = null;

export function getRedis(): Redis {
    if (!redis) {
        redis = new Redis(config.redisUrl, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });

        redis.on('error', (err: Error) => {
            console.error('Redis connection error:', err);
        });

        redis.on('connect', () => {
            console.log('✅ Redis connected');
        });
    }
    return redis;
}

// Cache keys
export const CacheKeys = {
    tenantBalance: (tenantId: string) => `tenant:${tenantId}:balance`,
    tenantConfig: (tenantId: string) => `tenant:${tenantId}:config`,
    tenantByPhone: (phone: string) => `phone:${phone}:tenant`,
    rateLimitPrefix: 'ratelimit:',
} as const;

// Cache TTL (in seconds)
export const CacheTTL = {
    balance: 60 * 5,      // 5 minutes
    config: 60 * 10,      // 10 minutes
    phoneMapping: 60 * 60, // 1 hour
} as const;

export default getRedis;
