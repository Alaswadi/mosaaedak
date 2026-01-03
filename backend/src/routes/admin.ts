import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { tenantService, usageService, paymentService, settingsService } from '../services/index.js';
import { paginationSchema, updateUserStatusSchema, registerSchema, adminUpdateTenantSchema, adminTopUpSchema } from '../utils/validation.js';
import { TenantStatus } from '@prisma/client';
import { authService } from '../services/authService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

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
 * GET /api/admin/settings/n8n-key
 * Get N8N integration API key
 */
router.get('/settings/n8n-key', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiKey = await settingsService.getN8nApiKey();
        res.json({ apiKey });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admin/settings/n8n-key/rotate
 * Rotate N8N integration API key
 */
router.post('/settings/n8n-key/rotate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiKey = await settingsService.rotateN8nApiKey();
        res.json({ apiKey, message: 'API key rotated successfully' });
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
 * POST /api/admin/tenants
 * Create a new tenant (Admin only)
 */
router.post('/tenants', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = registerSchema.parse(req.body);
        const result = await authService.registerCustomer(input);
        res.status(201).json({
            message: 'Tenant created successfully',
            user: result.user,
        });
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
 * PATCH /api/admin/tenants/:id
 * Update tenant details (Admin only)
 */
router.patch('/tenants/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = adminUpdateTenantSchema.parse(req.body);
        const result = await tenantService.updateTenant(req.params.id, input);
        res.json({
            message: 'Tenant updated successfully',
            tenant: result,
        });
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
 * POST /api/admin/tenants/:id/topup
 * Top up tenant wallet (Admin only)
 */
router.post('/tenants/:id/topup', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = adminTopUpSchema.parse(req.body);
        const { user } = req as any; // Admin user from auth middleware
        const result = await paymentService.adminTopUp(req.params.id, user.id, input);

        res.json({
            message: 'Top-up successful',
            ...result
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

/**
 * POST /api/admin/tenants/:id/upload-image
 * Upload image for tenant bot config
 */
const tenantImageUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const tenantId = req.params.id;
            const uploadPath = path.join(config.uploadDir, 'tenants', tenantId);
            // Ensure directory exists
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${uuidv4()}${ext}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, true);
    },
});

router.post(
    '/tenants/:id/upload-image',
    tenantImageUpload.single('image'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No image uploaded' });
                return;
            }

            const tenantId = req.params.id;
            const imageUrl = `${process.env.API_URL || 'http://localhost:3001'}/uploads/tenants/${tenantId}/${req.file.filename}`;

            res.json({ url: imageUrl });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
