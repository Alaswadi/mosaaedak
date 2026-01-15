import prisma from '../config/database.js';
import { NotificationType } from '@prisma/client';

export class NotificationService {
    /**
     * Create a new notification
     */
    async createNotification(
        type: NotificationType,
        title: string,
        message: string,
        tenantId?: string
    ) {
        return prisma.notification.create({
            data: {
                type,
                title,
                message,
                tenantId,
            },
        });
    }

    /**
     * Get unread notifications
     */
    async getUnreadNotifications(limit: number = 10) {
        return prisma.notification.findMany({
            where: { isRead: false },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                tenant: {
                    select: {
                        businessName: true
                    }
                }
            }
        });
    }

    /**
     * Get all notifications (paginated)
     */
    async getAllNotifications(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    tenant: {
                        select: {
                            businessName: true
                        }
                    }
                }
            }),
            prisma.notification.count()
        ]);

        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Mark notification as read
     */
    async markAsRead(id: string) {
        return prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    /**
     * Mark all as read
     */
    async markAllAsRead() {
        return prisma.notification.updateMany({
            where: { isRead: false },
            data: { isRead: true },
        });
    }
}

export const notificationService = new NotificationService();
