import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { tenantService, usageService } from '../services/index.js';
import { paginationSchema, updateUserStatusSchema } from '../utils/validation.js';
import { TenantStatus } from '@prisma/client';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/analytics
 * Get global analytics
 */
router.get('/analytics', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const days = parseInt(req.query.days as string) || 30;
        const analytics = await usageService.getGlobalAnalytics(days);
        res.json(analytics);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/tenants
 * List all tenants
 */
router.get('/tenants', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = paginationSchema.parse(req.query);
        const status = req.query.status as TenantStatus | undefined;
        const result = await tenantService.listTenants(page, limit, status);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/tenants/:id
 * Get single tenant details
 */
router.get('/tenants/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenant = await tenantService.getTenantProfile(req.params.id);
        res.json(tenant);
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/admin/tenants/:id/status
 * Update tenant status
 */
router.patch('/tenants/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = updateUserStatusSchema.parse(req.body);
        const tenant = await tenantService.updateTenantStatus(req.params.id, status as TenantStatus);
        res.json({
            message: `Tenant status updated to ${status}`,
            tenant,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/tenants/:id/usage
 * Get usage logs for specific tenant
 */
router.get('/tenants/:id/usage', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = paginationSchema.parse(req.query);
        const result = await usageService.getTenantUsageLogs(req.params.id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
