import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Authentication rate limiter (stricter)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per windowMs
    message: {
        error: 'Too many login attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Webhook rate limiter (per tenant phone)
 */
export const webhookLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 10, // 10 messages per second per phone
    keyGenerator: (req: Request) => {
        // Use the "To" phone number as the key
        return req.body?.To || req.ip || 'unknown';
    },
    message: {
        error: 'Message rate limit exceeded',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
