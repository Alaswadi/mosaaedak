import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireCustomer } from '../middleware/auth.js';
import { tenantService, walletService, usageService } from '../services/index.js';
import { updateBotConfigSchema, updateTwilioSchema, paginationSchema } from '../utils/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(requireCustomer);

/**
 * GET /api/tenant/profile
 * Get current tenant profile
 */
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await tenantService.getTenantProfile(req.user!.tenantId!);
        res.json(profile);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/tenant/wallet
 * Get wallet balance
 */
router.get('/wallet', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const balance = await walletService.getBalance(req.user!.tenantId!);
        res.json({ balance: balance.toNumber() });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/tenant/bot-config
 * Update bot configuration
 */
router.patch('/bot-config', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = updateBotConfigSchema.parse(req.body);
        const result = await tenantService.updateBotConfig(req.user!.tenantId!, input);
        res.json({
            message: 'Bot configuration updated',
            ...result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/tenant/twilio
 * Update Twilio credentials
 */
router.patch('/twilio', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = updateTwilioSchema.parse(req.body);
        const result = await tenantService.updateTwilioCredentials(req.user!.tenantId!, input);
        res.json({
            message: 'Twilio credentials updated',
            ...result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/tenant/usage
 * Get usage logs
 */
router.get('/usage', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = paginationSchema.parse(req.query);
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        const result = await usageService.getTenantUsageLogs(
            req.user!.tenantId!,
            page,
            limit,
            startDate,
            endDate
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/tenant/stats
 * Get usage statistics
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const days = parseInt(req.query.days as string) || 30;
        const stats = await usageService.getTenantStats(req.user!.tenantId!, days);
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

export default router;
