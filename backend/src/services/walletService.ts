import prisma from '../config/database.js';
import { getRedis, CacheKeys, CacheTTL } from '../config/redis.js';
import { config } from '../config/index.js';
import { Decimal } from '@prisma/client/runtime/library';

export class WalletService {
    /**
     * Get tenant balance (Redis-first with DB fallback)
     */
    async getBalance(tenantId: string): Promise<Decimal> {
        const redis = getRedis();
        const cacheKey = CacheKeys.tenantBalance(tenantId);

        // Try cache first
        const cached = await redis.get(cacheKey);
        if (cached !== null) {
            return new Decimal(cached);
        }

        // Fallback to database
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { walletBalance: true },
        });

        if (!tenant) {
            throw new Error('Tenant not found');
        }

        // Update cache
        await redis.setex(cacheKey, CacheTTL.balance, tenant.walletBalance.toString());

        return tenant.walletBalance;
    }

    /**
     * Check if tenant has sufficient balance
     */
    async hasSufficientBalance(tenantId: string, amount: number = config.costPerMessage): Promise<boolean> {
        const balance = await this.getBalance(tenantId);
        return balance.greaterThanOrEqualTo(new Decimal(amount));
    }

    /**
     * Add funds to wallet (after payment approval)
     */
    async addBalance(tenantId: string, amount: number): Promise<Decimal> {
        const redis = getRedis();

        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                walletBalance: {
                    increment: amount,
                },
            },
            select: { walletBalance: true },
        });

        // Update cache immediately
        const cacheKey = CacheKeys.tenantBalance(tenantId);
        await redis.setex(cacheKey, CacheTTL.balance, tenant.walletBalance.toString());

        return tenant.walletBalance;
    }

    /**
     * Deduct from wallet (per message)
     */
    async deductBalance(tenantId: string, amount: number = config.costPerMessage): Promise<Decimal> {
        const redis = getRedis();

        // Check balance first
        const hasBalance = await this.hasSufficientBalance(tenantId, amount);
        if (!hasBalance) {
            throw new Error('Insufficient balance');
        }

        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                walletBalance: {
                    decrement: amount,
                },
            },
            select: { walletBalance: true },
        });

        // Update cache
        const cacheKey = CacheKeys.tenantBalance(tenantId);
        await redis.setex(cacheKey, CacheTTL.balance, tenant.walletBalance.toString());

        return tenant.walletBalance;
    }

    /**
     * Process monthly subscription
     */
    async processMonthlyBilling(tenantId: string): Promise<{ success: boolean; newBalance?: Decimal; error?: string }> {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { walletBalance: true, monthlyFee: true, status: true },
        });

        if (!tenant) {
            return { success: false, error: 'Tenant not found' };
        }

        if (tenant.status !== 'ACTIVE') {
            return { success: false, error: 'Tenant not active' };
        }

        const fee = tenant.monthlyFee.toNumber();

        if (tenant.walletBalance.lessThan(fee)) {
            // Insufficient balance - pause account
            await prisma.tenant.update({
                where: { id: tenantId },
                data: { status: 'PAUSED' },
            });

            // Invalidate cache
            const redis = getRedis();
            await redis.del(CacheKeys.tenantBalance(tenantId));

            return { success: false, error: 'Insufficient balance for monthly fee' };
        }

        // Deduct fee and update billing date
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const updated = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                walletBalance: { decrement: fee },
                nextBillingDate: nextMonth,
            },
            select: { walletBalance: true },
        });

        // Update cache
        const redis = getRedis();
        await redis.setex(CacheKeys.tenantBalance(tenantId), CacheTTL.balance, updated.walletBalance.toString());

        return { success: true, newBalance: updated.walletBalance };
    }

    /**
     * Invalidate cache for tenant
     */
    async invalidateCache(tenantId: string): Promise<void> {
        const redis = getRedis();
        await redis.del(CacheKeys.tenantBalance(tenantId));
        await redis.del(CacheKeys.tenantConfig(tenantId));
    }
}

export const walletService = new WalletService();
