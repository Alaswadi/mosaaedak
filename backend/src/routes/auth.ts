import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/index.js';
import { registerSchema, loginSchema } from '../utils/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply stricter rate limiting to auth routes
router.use(authLimiter);

/**
 * POST /api/auth/register
 * Register a new customer account
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = registerSchema.parse(req.body);
        const result = await authService.registerCustomer(input);

        res.status(201).json({
            message: 'Registration successful',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/login
 * Login for both customers and admins
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = loginSchema.parse(req.body);
        const result = await authService.login(input);

        res.json({
            message: 'Login successful',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
