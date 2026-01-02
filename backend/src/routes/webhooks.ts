import { Router, Request, Response, NextFunction } from 'express';
import { tenantService, usageService, walletService } from '../services/index.js';
import { webhookLimiter } from '../middleware/rateLimiter.js';
import { config } from '../config/index.js';
import { getRedis } from '../config/redis.js';

const router = Router();

// Apply webhook rate limiting
router.use(webhookLimiter);

/**
 * POST /api/webhooks/twilio/incoming
 * Handle incoming WhatsApp messages from Twilio
 */
router.post('/twilio/incoming', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            From: fromPhone,
            To: toPhone,
            Body: messageBody,
            MessageSid: messageSid,
        } = req.body;

        console.log(`📨 Incoming message from ${fromPhone} to ${toPhone}`);

        // 1. Find tenant by their Twilio phone number
        const tenant = await tenantService.getTenantByPhone(toPhone);

        if (!tenant) {
            console.log(`❌ No tenant found for phone: ${toPhone}`);
            res.status(404).send('Tenant not found');
            return;
        }

        // 2. Check tenant status
        if (tenant.status === 'BANNED') {
            console.log(`🚫 Tenant ${tenant.id} is banned`);
            res.status(403).send('Service unavailable');
            return;
        }

        // 3. THE "KILL SWITCH" - Check balance
        const hasBalance = await walletService.hasSufficientBalance(tenant.id);

        if (!hasBalance || tenant.status === 'PAUSED') {
            console.log(`💰 Tenant ${tenant.id} has insufficient balance or is paused`);

            // Send "Service Suspended" message via TwiML
            res.type('text/xml').send(`
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Message>خدمة الرد التلقائي موقوفة مؤقتاً. يرجى شحن رصيدك لمتابعة الخدمة.
          
Service suspended. Please top up your balance to continue.</Message>
        </Response>
      `);
            return;
        }

        // 4. Log inbound message
        await usageService.logMessage(
            tenant.id,
            'INBOUND',
            messageBody,
            fromPhone,
            toPhone,
            messageSid
        );

        // 5. Package data and send to n8n webhook
        const n8nPayload = {
            tenantId: tenant.id,
            businessName: tenant.businessName,
            fromPhone,
            toPhone,
            message: messageBody,
            messageSid,
            systemPrompt: tenant.systemPrompt || 'You are a helpful assistant.',
            aiModel: tenant.aiModel || 'gpt-3.5-turbo',
            twilioSid: tenant.twilioSid,
            twilioToken: tenant.twilioToken, // Already decrypted by tenantService
            callbackUrl: `${req.protocol}://${req.get('host')}/api/webhooks/n8n/callback`,
        };

        // Push to n8n webhook (fire and forget)
        fetch(config.n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(n8nPayload),
        }).catch(err => {
            console.error('Failed to send to n8n:', err);
        });

        // Respond immediately (n8n will handle the actual reply)
        res.status(200).send('OK');

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/webhooks/twilio/status
 * Handle message status callbacks
 */
router.post('/twilio/status', async (req: Request, res: Response) => {
    const { MessageSid, MessageStatus } = req.body;
    console.log(`📊 Message ${MessageSid} status: ${MessageStatus}`);
    res.status(200).send('OK');
});

/**
 * POST /api/webhooks/n8n/callback
 * Callback from n8n after sending AI response
 */
router.post('/n8n/callback', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            tenantId,
            success,
            responseMessage,
            messageSid,
            fromPhone,
            toPhone,
            error,
        } = req.body;

        if (!success) {
            console.error(`❌ n8n callback error for tenant ${tenantId}:`, error);
            res.status(200).send('Error logged');
            return;
        }

        // Log outbound message and deduct balance
        await usageService.logMessage(
            tenantId,
            'OUTBOUND',
            responseMessage || 'AI response sent',
            toPhone, // From the bot's perspective
            fromPhone, // To the user
            messageSid
        );

        console.log(`✅ Response sent and logged for tenant ${tenantId}`);
        res.status(200).send('Logged');

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/webhooks/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
    const redis = getRedis();

    try {
        await redis.ping();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                redis: 'connected',
                n8n: config.n8nWebhookUrl,
            },
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: 'Redis connection failed',
        });
    }
});

export default router;
