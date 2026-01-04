import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get list of conversations (unique users)
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'CUSTOMER' || !user.tenantId) {
            res.status(403).json({ error: 'Unauthorized access' });
            return;
        }

        // Get unique phone numbers from UsageLog for this tenant
        // We'll group by fromPhone/toPhone to get unique conversations
        // Since we want the latest message, we can't easily use distinct on just phone
        // So we'll fetch all logs and aggregate in memory (or use a raw query for performance later)
        // For now, let's use a raw query to get the latest message for each conversation efficiently

        // This query finds the latest message for each unique interactant (either sender or receiver)
        // that is NOT the tenant's own number (assuming tenant messages are OUTBOUND)
        // Actually, simpler: distinct 'remote' phone number.

        // Let's get all logs for tenant, ordered by date desc
        // Limitation: large dataset. 
        // Better approach: Group by conversation partner.

        // A conversation is defined by the 'other' phone number.
        // If direction is INBOUND, other = fromPhone.
        // If direction is OUTBOUND, other = toPhone.

        const logs = await prisma.usageLog.findMany({
            where: {
                tenantId: user.tenantId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 500 // Limit for initial load performance, maybe paginate later
        });

        const conversationsMap = new Map();

        logs.forEach(log => {
            let otherPhone: string | null = null;

            if (log.direction === 'INBOUND') {
                otherPhone = log.fromPhone;
            } else {
                otherPhone = log.toPhone;
            }

            if (otherPhone && !conversationsMap.has(otherPhone)) {
                conversationsMap.set(otherPhone, {
                    phoneNumber: otherPhone,
                    lastMessage: log.content,
                    lastMessageAt: log.createdAt,
                    direction: log.direction
                });
            }
        });

        const conversations = Array.from(conversationsMap.values());

        res.json({ conversations });

    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get message history for a specific phone number
router.get('/:phoneNumber/messages', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { phoneNumber } = req.params;

        if (!user || user.role !== 'CUSTOMER' || !user.tenantId) {
            res.status(403).json({ error: 'Unauthorized access' });
            return;
        }

        const messages = await prisma.usageLog.findMany({
            where: {
                tenantId: user.tenantId,
                OR: [
                    { fromPhone: phoneNumber },
                    { toPhone: phoneNumber }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        res.json({ messages });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

export default router;
