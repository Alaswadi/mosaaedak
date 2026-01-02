import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { RegisterInput, LoginInput } from '../utils/validation.js';
import { AppError } from '../middleware/errorHandler.js';

export const SALT_ROUNDS = 12;

export class AuthService {
    /**
     * Register a new customer with tenant
     */
    async registerCustomer(input: RegisterInput) {
        const { email, password, name, phone, businessName } = input;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new AppError(409, 'Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create tenant and user in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create tenant first
            const tenant = await tx.tenant.create({
                data: {
                    businessName,
                    walletBalance: 0,
                },
            });

            // Create user with tenant relation
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    name,
                    phone,
                    role: 'CUSTOMER',
                    tenantId: tenant.id,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    tenantId: true,
                    tenant: {
                        select: {
                            id: true,
                            businessName: true,
                            walletBalance: true,
                            status: true,
                        },
                    },
                },
            });

            return user;
        });

        // Generate token
        const token = generateToken({
            userId: result.id,
            email: result.email,
            role: result.role,
            tenantId: result.tenantId,
        });

        return {
            user: result,
            token,
        };
    }

    /**
     * Login user (admin or customer)
     */
    async login(input: LoginInput) {
        const { email, password } = input;

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                tenant: {
                    select: {
                        id: true,
                        businessName: true,
                        walletBalance: true,
                        status: true,
                    },
                },
            },
        });

        if (!user) {
            throw new AppError(401, 'Invalid email or password');
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            throw new AppError(401, 'Invalid email or password');
        }

        // Check if customer's tenant is banned
        if (user.role === 'CUSTOMER' && user.tenant?.status === 'BANNED') {
            throw new AppError(403, 'Your account has been suspended. Please contact support.');
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        });

        // Remove sensitive data
        const { passwordHash: _, ...safeUser } = user;

        return {
            user: safeUser,
            token,
        };
    }

    /**
     * Create admin user (for initial setup)
     */
    async createAdmin(email: string, password: string, name: string) {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const admin = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                role: 'ADMIN',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return admin;
    }

    /**
     * Change password
     */
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!validPassword) {
            throw new AppError(401, 'Current password is incorrect');
        }

        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });

        return { success: true };
    }
}

export const authService = new AuthService();
