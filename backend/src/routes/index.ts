import { Router } from 'express';
import authRoutes from './auth.js';
import tenantRoutes from './tenant.js';
import paymentRoutes from './payments.js';
import adminRoutes from './admin.js';
import webhookRoutes from './webhooks.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/tenant', tenantRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
