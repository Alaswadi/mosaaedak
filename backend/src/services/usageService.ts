import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { walletService } from './walletService.js';
import { MessageDirection } from '@prisma/client';

export class UsageService {
    /**
     * Log a message and deduct cost
     */
    async logMessage(
        tenantId: string,
        direction: MessageDirection,
        content: string,
        fromPhone?: string,
        toPhone?: string,
        messageId?: string
    ) {
        const cost = config.costPerMessage;

        // Create usage log
        const log = await prisma.usageLog.create({
            data: {
                tenantId,
                direction,
                content,
                cost,
                fromPhone,
                toPhone,
                messageId,
            },
        });

        // Deduct from wallet (only for outbound messages)
        if (direction === 'OUTBOUND') {
            await walletService.deductBalance(tenantId, cost);
        }

        return log;
    }

    /**
     * Get usage logs for tenant
     */
    async getTenantUsageLogs(
        tenantId: string,
        page: number = 1,
        limit: number = 50,
        startDate?: Date,
        endDate?: Date
    ) {
        const skip = (page - 1) * limit;

        const where: any = { tenantId };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const [logs, total] = await Promise.all([
            prisma.usageLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.usageLog.count({ where }),
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get usage statistics for tenant
     */
    async getTenantStats(tenantId: string, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [messageStats, costStats] = await Promise.all([
            prisma.usageLog.groupBy({
                by: ['direction'],
                where: {
                    tenantId,
                    createdAt: { gte: startDate },
                },
                _count: true,
            }),
            prisma.usageLog.aggregate({
                where: {
                    tenantId,
                    createdAt: { gte: startDate },
                },
                _sum: { cost: true },
            }),
        ]);

        const inbound = messageStats.find(s => s.direction === 'INBOUND')?._count || 0;
        const outbound = messageStats.find(s => s.direction === 'OUTBOUND')?._count || 0;

        return {
            period: `${days} days`,
            totalMessages: inbound + outbound,
            inboundMessages: inbound,
            outboundMessages: outbound,
            totalCost: costStats._sum.cost?.toNumber() || 0,
        };
    }

    /**
     * Get global analytics (admin)
     */
    async getGlobalAnalytics(days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [
            totalMessages,
            totalRevenue,
            activeTenants,
            pendingPayments,
            dailyStats,
        ] = await Promise.all([
            // Total messages
            prisma.usageLog.count({
                where: { createdAt: { gte: startDate } },
            }),

            // Total revenue (approved payments)
            prisma.paymentTransaction.aggregate({
                where: {
                    status: 'APPROVED',
                    createdAt: { gte: startDate },
                },
                _sum: { amount: true },
            }),

            // Active tenants
            prisma.tenant.count({
                where: { status: 'ACTIVE' },
            }),

            // Pending payments count
            prisma.paymentTransaction.count({
                where: { status: 'PENDING' },
            }),

            // Daily message stats (last 7 days)
            prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as count
        FROM "UsageLog"
        WHERE "createdAt" >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
      `,
        ]);

        return {
            period: `${days} days`,
            totalMessages,
            totalRevenue: totalRevenue._sum.amount?.toNumber() || 0,
            activeTenants,
            pendingPayments,
            dailyStats,
        };
    }
}

export const usageService = new UsageService();
