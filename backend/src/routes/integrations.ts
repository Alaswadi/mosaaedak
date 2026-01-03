import { Router, Request, Response, NextFunction } from 'express';
import { tenantService, settingsService } from '../services/index.js';
import { z } from 'zod';

const router = Router();

// Validation schema
const phoneQuerySchema = z.object({
    phone: z.string().min(5),
});

// Middleware: Validate API Key
router.use(async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
        res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid API key' });
        return;
    }

    const isValid = await settingsService.validateN8nApiKey(apiKey);
    if (!isValid) {
        res.status(403).json({ error: 'Forbidden', message: 'Invalid API key' });
        return;
    }

    next();
});

/**
 * GET /api/integrations/n8n/context
 * Retrieve tenant context (system prompt, ai model) by phone number
 * Used by n8n to fetch the correct prompt for the bot
 */
router.get('/n8n/context', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone } = phoneQuerySchema.parse(req.query);
        const cleanPhone = phone.trim();

        // Find tenant by their Twilio phone number (or User phone as fallback)
        const tenant = await tenantService.getTenantByPhone(cleanPhone);

        if (!tenant) {
            res.status(404).json({
                error: 'Tenant not found',
                message: `No active tenant found for phone number: ${phone}`
            });
            return;
        }

        if (tenant.status === 'BANNED' || tenant.status === 'PAUSED') {
            res.status(403).json({
                error: 'Service unavailable',
                message: 'Tenant is banned or paused'
            });
            return;
        }

        // Return only necessary context
        res.json({
            tenantId: tenant.id,
            businessName: tenant.businessName,
            systemPrompt: tenant.systemPrompt || 'You are a helpful assistant.',
            aiModel: tenant.aiModel || 'gpt-3.5-turbo',
            walletBalance: tenant.walletBalance,
        });

    } catch (error) {
        next(error);
    }
});

export default router;
