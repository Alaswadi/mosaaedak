import prisma from '../config/database.js';
import { walletService } from './walletService.js';
import { AppError } from '../middleware/errorHandler.js';
import { TopUpRequestInput, ReviewPaymentInput } from '../utils/validation.js';
import { TransactionStatus, PaymentMethod } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config/index.js';

export class PaymentService {
    /**
     * Create a top-up request (customer)
     */
    async createTopUpRequest(
        tenantId: string,
        input: TopUpRequestInput,
        proofFilePath?: string
    ) {
        const transaction = await prisma.paymentTransaction.create({
            data: {
                tenantId,
                amount: input.amount,
                method: input.method as PaymentMethod,
                proofPath: proofFilePath,
                status: 'PENDING',
            },
            include: {
                tenant: {
                    select: {
                        businessName: true,
                    },
                },
            },
        });

        return transaction;
    }

    /**
     * Get pending payments (admin)
     */
    async getPendingPayments(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            prisma.paymentTransaction.findMany({
                where: { status: 'PENDING' },
                include: {
                    tenant: {
                        select: {
                            businessName: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.paymentTransaction.count({
                where: { status: 'PENDING' },
            }),
        ]);

        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Review payment (approve/reject) - admin
     */
    async reviewPayment(
        transactionId: string,
        adminUserId: string,
        input: ReviewPaymentInput
    ) {
        const transaction = await prisma.paymentTransaction.findUnique({
            where: { id: transactionId },
        });

        if (!transaction) {
            throw new AppError(404, 'Transaction not found');
        }

        if (transaction.status !== 'PENDING') {
            throw new AppError(400, 'Transaction has already been reviewed');
        }

        const updateData: any = {
            status: input.status as TransactionStatus,
            reviewedById: adminUserId,
            reviewedAt: new Date(),
        };

        if (input.status === 'REJECTED' && input.notes) {
            updateData.rejectionNotes = input.notes;
        }

        const updated = await prisma.paymentTransaction.update({
            where: { id: transactionId },
            data: updateData,
            include: {
                tenant: {
                    select: {
                        id: true,
                        businessName: true,
                        walletBalance: true,
                    },
                },
            },
        });

        // If approved, add balance to wallet
        if (input.status === 'APPROVED') {
            const newBalance = await walletService.addBalance(
                transaction.tenantId,
                transaction.amount.toNumber()
            );

            return {
                transaction: updated,
                newBalance,
            };
        }

        return { transaction: updated };
    }

    /**
     * Get transaction history for tenant
     */
    async getTenantTransactions(tenantId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            prisma.paymentTransaction.findMany({
                where: { tenantId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.paymentTransaction.count({
                where: { tenantId },
            }),
        ]);

        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get all transactions (admin)
     */
    async getAllTransactions(
        page: number = 1,
        limit: number = 20,
        status?: TransactionStatus
    ) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};

        const [transactions, total] = await Promise.all([
            prisma.paymentTransaction.findMany({
                where,
                include: {
                    tenant: {
                        select: {
                            businessName: true,
                            user: {
                                select: { name: true, email: true },
                            },
                        },
                    },
                    reviewedBy: {
                        select: { name: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.paymentTransaction.count({ where }),
        ]);

        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get payment proof file path
     */
    getProofFilePath(filename: string): string {
        return path.join(config.uploadDir, 'proofs', filename);
    }

    /**
     * Ensure upload directory exists
     */
    async ensureUploadDir(): Promise<void> {
        const proofsDir = path.join(config.uploadDir, 'proofs');
        await fs.mkdir(proofsDir, { recursive: true });
    }
}

export const paymentService = new PaymentService();
