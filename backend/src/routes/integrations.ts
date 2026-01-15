import { Router, Request, Response, NextFunction } from 'express';
import { tenantService, settingsService, usageService } from '../services/index.js';
import { z } from 'zod';

const router = Router();

// Validation schema
const phoneQuerySchema = z.object({
    phone: z.string().min(5),
});

const usageBodySchema = z.object({
    tenantId: z.string().uuid(),
    direction: z.enum(['INBOUND', 'OUTBOUND']),
    content: z.string(),
    from: z.string().optional(), // User's phone number
    cost: z.number().optional(),
    deduct: z.boolean().optional(),
    messageId: z.string().optional(),
    output: z.string().optional(), // Pass-through field for flow continuity
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

/**
 * GET /api/integrations/facebook/config/:pageId
 * Retrieve tenant config by Facebook Page ID
 */
router.get('/facebook/config/:pageId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pageId } = req.params;

        if (!pageId) {
            res.status(400).json({ error: 'Page ID required' });
            return;
        }

        const tenant = await tenantService.getTenantByFacebookPageId(pageId);

        if (!tenant) {
            res.status(404).json({
                error: 'Tenant not found',
                message: `No tenant configured for Facebook Page ID: ${pageId}`
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

        res.json({
            tenantId: tenant.id,
            businessName: tenant.businessName,
            systemPrompt: tenant.systemPrompt,
            facebookPrompt: tenant.facebookPrompt,
            facebookAccessToken: tenant.facebookAccessToken,
            // Fallback content if specific facebook prompt is missing
            activePrompt: tenant.facebookPrompt || tenant.systemPrompt || 'You are a helpful assistant.',
            aiModel: tenant.aiModel || 'gpt-3.5-turbo',
        });

    } catch (error) {
        next(error);
    }
});

router.post('/n8n/usage', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = usageBodySchema.parse(req.body);

        // Log message and deduct balance if requested
        // For INBOUND, fromPhone is the sender (body.from)
        // For OUTBOUND, toPhone is the recipient (so if we were logging outbound directly, we'd need 'to')
        const log = await usageService.logMessage(
            body.tenantId,
            body.direction,
            body.content,
            body.direction === 'INBOUND' ? body.from : undefined, // fromPhone
            body.direction === 'OUTBOUND' ? body.from : undefined, // toPhone (if direction was outbound initially)
            body.messageId,
            {
                cost: body.cost,
                deduct: body.deduct
            }
        );

        // If output is provided, log it as an OUTBOUND message (bot reply)
        // We set cost to 0 and deduct to false as the cost is typically covered by the inbound trigger
        // For the reply (OUTBOUND), the 'toPhone' is the user's phone (body.from)
        let replyLogId = undefined;
        if (body.output) {
            const replyLog = await usageService.logMessage(
                body.tenantId,
                'OUTBOUND',
                body.output,
                undefined, // from (system/bot)
                body.from, // toPhone (the user)
                undefined,
                {
                    cost: 0,
                    deduct: false
                }
            );
            replyLogId = replyLog.id;
        }

        res.json({
            success: true,
            logId: log.id,
            replyLogId,
            cost: log.cost,
            output: body.output, // Echo back the output for n8n flow
        });

    } catch (error) {
        // If insufficient balance, return 402 Payment Required
        if (error instanceof Error && error.message === 'Insufficient balance') {
            res.status(402).json({
                error: 'Payment Required',
                message: 'Insufficient balance'
            });
            return;
        }
        next(error);
    }
});

export default router;
