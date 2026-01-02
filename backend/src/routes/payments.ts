import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireCustomer, requireAdmin } from '../middleware/auth.js';
import { paymentService } from '../services/index.js';
import { topUpRequestSchema, reviewPaymentSchema, paginationSchema } from '../utils/validation.js';
import { config } from '../config/index.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(config.uploadDir, 'proofs');
        await paymentService.ensureUploadDir();
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: config.maxFileSize,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
        }
    },
});

// Customer routes
router.use('/customer', authenticate, requireCustomer);

/**
 * POST /api/payments/customer/topup
 * Request a top-up (with proof upload)
 */
router.post(
    '/customer/topup',
    authenticate,
    requireCustomer,
    upload.single('proof'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const input = topUpRequestSchema.parse({
                amount: parseFloat(req.body.amount),
                method: req.body.method,
            });

            const proofPath = req.file?.filename || undefined;

            const transaction = await paymentService.createTopUpRequest(
                req.user!.tenantId!,
                input,
                proofPath
            );

            res.status(201).json({
                message: 'Top-up request submitted. Waiting for approval.',
                transaction,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/payments/customer/history
 * Get payment history for current tenant
 */
router.get(
    '/customer/history',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit } = paginationSchema.parse(req.query);
            const result = await paymentService.getTenantTransactions(
                req.user!.tenantId!,
                page,
                limit
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

// Admin routes
router.use('/admin', authenticate, requireAdmin);

/**
 * GET /api/payments/admin/pending
 * Get pending payments (admin)
 */
router.get(
    '/admin/pending',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit } = paginationSchema.parse(req.query);
            const result = await paymentService.getPendingPayments(page, limit);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/payments/admin/all
 * Get all transactions (admin)
 */
router.get(
    '/admin/all',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit } = paginationSchema.parse(req.query);
            const status = req.query.status as any;
            const result = await paymentService.getAllTransactions(page, limit, status);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/payments/admin/:id/review
 * Review (approve/reject) a payment (admin)
 */
router.post(
    '/admin/:id/review',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const input = reviewPaymentSchema.parse(req.body);

            const result = await paymentService.reviewPayment(id, req.user!.id, input);

            res.json({
                message: `Payment ${input.status.toLowerCase()}`,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/payments/admin/proof/:filename
 * Get payment proof file (admin)
 */
router.get(
    '/admin/proof/:filename',
    authenticate,
    requireAdmin,
    (req: Request, res: Response) => {
        const { filename } = req.params;
        const filePath = paymentService.getProofFilePath(filename);
        res.sendFile(filePath);
    }
);

export default router;
