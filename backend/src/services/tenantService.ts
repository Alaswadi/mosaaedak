import prisma from '../config/database.js';
import { getRedis, CacheKeys, CacheTTL } from '../config/redis.js';
import { AppError } from '../middleware/errorHandler.js';
import {
    UpdateBotConfigInput,
    UpdateTwilioInput,
    AdminUpdateTenantInput
} from '../utils/validation.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { TenantStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from './authService.js';

export class TenantService {
    /**
     * Get tenant profile with balance
     */
    async getTenantProfile(tenantId: string) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                businessName: true,
                walletBalance: true,
                twilioPhone: true,
                systemPrompt: true,
                aiModel: true,
                status: true,
                monthlyFee: true,
                nextBillingDate: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!tenant) {
            throw new AppError(404, 'Tenant not found');
        }

        return tenant;
    }

    /**
     * Update bot configuration
     */
    async updateBotConfig(tenantId: string, input: UpdateBotConfigInput) {
        const redis = getRedis();

        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                systemPrompt: input.systemPrompt,
                aiModel: input.aiModel,
            },
            select: {
                systemPrompt: true,
                aiModel: true,
            },
        });

        // Invalidate config cache
        await redis.del(CacheKeys.tenantConfig(tenantId));

        return tenant;
    }

    /**
     * Update Twilio credentials (encrypted)
     */
    async updateTwilioCredentials(tenantId: string, input: UpdateTwilioInput) {
        const redis = getRedis();

        // Encrypt the token before storing
        const encryptedToken = encrypt(input.twilioToken);

        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                twilioSid: input.twilioSid,
                twilioToken: encryptedToken,
                twilioPhone: input.twilioPhone,
            },
            select: {
                twilioSid: true,
                twilioPhone: true,
            },
        });

        // Update phone mapping cache
        await redis.setex(
            CacheKeys.tenantByPhone(input.twilioPhone),
            CacheTTL.phoneMapping,
            tenantId
        );

        // Invalidate config cache
        await redis.del(CacheKeys.tenantConfig(tenantId));

        return tenant;
    }

    /**
     * Get tenant by phone number (for webhook routing)
     */
    async getTenantByPhone(phoneNumber: string) {
        const redis = getRedis();
        const cacheKey = CacheKeys.tenantByPhone(phoneNumber);

        // Try cache first
        const cachedTenantId = await redis.get(cacheKey);
        if (cachedTenantId) {
            return this.getTenantForMessaging(cachedTenantId);
        }

        // Fallback to database
        // 1. Try finding by Tenant.twilioPhone
        let tenant = await prisma.tenant.findUnique({
            where: { twilioPhone: phoneNumber },
            select: {
                id: true,
                businessName: true,
                walletBalance: true,
                systemPrompt: true,
                aiModel: true,
                twilioSid: true,
                twilioToken: true,
                status: true,
            },
        });

        // 2. Fallback: Try finding by User.phone
        if (!tenant) {
            // Find user with this phone who has a tenant
            const user = await prisma.user.findFirst({
                where: { phone: phoneNumber },
                include: {
                    tenant: {
                        select: {
                            id: true,
                            businessName: true,
                            walletBalance: true,
                            systemPrompt: true,
                            aiModel: true,
                            twilioSid: true,
                            twilioToken: true,
                            status: true,
                        }
                    }
                }
            });

            if (user && user.tenant) {
                tenant = user.tenant;
            }
        }

        if (tenant) {
            // Cache the mapping for future speed
            await redis.setex(cacheKey, CacheTTL.phoneMapping, tenant.id);
        }

        return tenant;
    }

    /**
     * Get tenant config for messaging (with decrypted credentials)
     */
    async getTenantForMessaging(tenantId: string) {
        const redis = getRedis();
        const cacheKey = CacheKeys.tenantConfig(tenantId);

        // Try cache first (without credentials)
        const cached = await redis.get(cacheKey);
        if (cached) {
            const config = JSON.parse(cached);
            // Get credentials from DB (not cached for security)
            const credentials = await prisma.tenant.findUnique({
                where: { id: tenantId },
                select: { twilioSid: true, twilioToken: true },
            });

            if (credentials?.twilioToken) {
                config.twilioToken = decrypt(credentials.twilioToken);
                config.twilioSid = credentials.twilioSid;
            }

            return config;
        }

        // Fallback to database
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                businessName: true,
                walletBalance: true,
                systemPrompt: true,
                aiModel: true,
                twilioSid: true,
                twilioToken: true,
                status: true,
            },
        });

        if (!tenant) {
            return null;
        }

        // Cache config (without credentials)
        const cacheData = {
            id: tenant.id,
            businessName: tenant.businessName,
            walletBalance: tenant.walletBalance.toString(),
            systemPrompt: tenant.systemPrompt,
            aiModel: tenant.aiModel,
            status: tenant.status,
        };
        await redis.setex(cacheKey, CacheTTL.config, JSON.stringify(cacheData));

        // Decrypt token for return
        if (tenant.twilioToken) {
            return {
                ...tenant,
                twilioToken: decrypt(tenant.twilioToken),
            };
        }

        return tenant;
    }

    /**
     * List all tenants (admin)
     */
    async listTenants(page: number = 1, limit: number = 20, status?: TenantStatus) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};

        const [tenants, total] = await Promise.all([
            prisma.tenant.findMany({
                where,
                select: {
                    id: true,
                    businessName: true,
                    walletBalance: true,
                    status: true,
                    createdAt: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true,
                            lastLoginAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.tenant.count({ where }),
        ]);

        return {
            tenants,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update tenant status (admin)
     */
    async updateTenantStatus(tenantId: string, status: TenantStatus) {
        const redis = getRedis();

        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: { status },
            select: {
                id: true,
                businessName: true,
                status: true,
            },
        });

        // Invalidate caches
        await redis.del(CacheKeys.tenantConfig(tenantId));
        await redis.del(CacheKeys.tenantBalance(tenantId));

        return tenant;
    }

    /**
     * Update tenant details (admin)
     */
    async updateTenant(tenantId: string, input: AdminUpdateTenantInput) {
        const redis = getRedis();
        const { name, email, businessName, phone, walletBalance, password, status, systemPrompt, aiModel } = input;

        // Prepare data for update
        let passwordHash: string | undefined;
        if (password) {
            passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        }

        // We use a transaction because we might need to update both User and Tenant
        const result = await prisma.$transaction(async (tx) => {
            // Update tenant fields
            if (businessName || walletBalance !== undefined || status || systemPrompt !== undefined || aiModel) {
                await tx.tenant.update({
                    where: { id: tenantId },
                    data: {
                        ...(businessName && { businessName }),
                        ...(walletBalance !== undefined && { walletBalance }),
                        ...(status && { status }),
                        ...(systemPrompt !== undefined && { systemPrompt }),
                        ...(aiModel && { aiModel }),
                    },
                });
            }

            // Update user fields
            if (name || email || phone || passwordHash) {
                // Find user associated with this tenant
                const user = await tx.user.findFirst({
                    where: { tenantId },
                });

                if (user) {
                    await tx.user.update({
                        where: { id: user.id },
                        data: {
                            ...(name && { name }),
                            ...(email && { email }),
                            ...(phone && { phone }),
                            ...(passwordHash && { passwordHash }),
                        },
                    });
                }
            }

            // Return fresh data
            return tx.tenant.findUnique({
                where: { id: tenantId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        }
                    }
                }
            });
        });

        // Invalidate caches
        await redis.del(CacheKeys.tenantConfig(tenantId));
        await redis.del(CacheKeys.tenantBalance(tenantId));

        return result;
    }
}

export const tenantService = new TenantService();
