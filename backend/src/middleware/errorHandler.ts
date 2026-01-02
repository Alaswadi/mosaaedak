import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error('Error:', err);

    // Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation failed',
            details: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }

    // Custom application errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
        });
        return;
    }

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;
        if (prismaError.code === 'P2002') {
            res.status(409).json({
                error: 'A record with this value already exists',
            });
            return;
        }
        if (prismaError.code === 'P2025') {
            res.status(404).json({
                error: 'Record not found',
            });
            return;
        }
    }

    // Default error response
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        error: `Route ${req.method} ${req.path} not found`,
    });
}
