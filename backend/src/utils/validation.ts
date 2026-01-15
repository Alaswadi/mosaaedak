import { z } from 'zod';

// Authentication schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    initialPayment: z.number().positive('Amount must be positive').optional(),
    paymentMethod: z.enum(['KURIMI', 'USDT', 'CASH']).optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Profile update schema
export const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    businessName: z.string().min(2).optional(),
});

// Bot configuration schema
export const updateBotConfigSchema = z.object({
    systemPrompt: z.string().max(100000, 'System prompt too long').optional(),
    aiModel: z.enum(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']).optional(),
    facebookPrompt: z.string().max(100000, 'Facebook prompt too long').optional(),
    facebookPageId: z.string().optional(),
});

// Twilio credentials schema
export const updateTwilioSchema = z.object({
    twilioSid: z.string().min(1, 'Twilio SID is required'),
    twilioToken: z.string().min(1, 'Twilio Auth Token is required'),
    twilioPhone: z.string().min(1, 'Twilio Phone Number is required'),
});

// Payment schemas
export const topUpRequestSchema = z.object({
    amount: z.number().positive('Amount must be positive').min(5, 'Minimum top-up is $5'),
    method: z.enum(['KURIMI', 'USDT', 'CASH']),
});

export const reviewPaymentSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    notes: z.string().optional(),
});

// Admin user management
export const updateUserStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'PAUSED', 'BANNED']),
});

export const adminUpdateTenantSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    businessName: z.string().min(2).optional(),
    phone: z.string().optional(),
    walletBalance: z.coerce.number().min(0).optional(),
    password: z.string().min(8).optional(), // Allow admin to reset password
    status: z.enum(['ACTIVE', 'PAUSED', 'BANNED']).optional(),
    systemPrompt: z.string().max(100000).optional(),
    aiModel: z.enum(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']).optional(),
    facebookPrompt: z.string().max(100000).optional(),
    facebookPageId: z.string().optional(),
});

export const adminTopUpSchema = z.object({
    amount: z.number().positive(),
    method: z.enum(['CASH', 'KURIMI', 'USDT']),
    notes: z.string().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

// Type exports
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateBotConfigInput = z.infer<typeof updateBotConfigSchema>;
export type UpdateTwilioInput = z.infer<typeof updateTwilioSchema>;
export type TopUpRequestInput = z.infer<typeof topUpRequestSchema>;
export type ReviewPaymentInput = z.infer<typeof reviewPaymentSchema>;
export type AdminTopUpInput = z.infer<typeof adminTopUpSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type AdminUpdateTenantInput = z.infer<typeof adminUpdateTenantSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

export type RegisterInput = z.infer<typeof registerSchema> & {
    initialPayment?: number;
    paymentMethod?: 'KURIMI' | 'USDT' | 'CASH';
};
export type LoginInput = z.infer<typeof loginSchema>;
