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

// ... (middleware remains same)

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
