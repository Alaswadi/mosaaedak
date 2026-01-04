import { Router } from 'express';
import authRoutes from './auth.js';
import tenantRoutes from './tenant.js';
import paymentRoutes from './payments.js';
import adminRoutes from './admin.js';
import webhookRoutes from './webhooks.js';
import integrationRoutes from './integrations.js';
import conversationRoutes from './conversations.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/tenant', tenantRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/integrations', integrationRoutes);
router.use('/conversations', conversationRoutes);

export default router;
