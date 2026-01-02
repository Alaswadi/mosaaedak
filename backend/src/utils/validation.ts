import { z } from 'zod';

// Authentication schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
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
    systemPrompt: z.string().max(4000, 'System prompt too long').optional(),
    aiModel: z.enum(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']).optional(),
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

// Pagination schema
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateBotConfigInput = z.infer<typeof updateBotConfigSchema>;
export type UpdateTwilioInput = z.infer<typeof updateTwilioSchema>;
export type TopUpRequestInput = z.infer<typeof topUpRequestSchema>;
export type ReviewPaymentInput = z.infer<typeof reviewPaymentSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
