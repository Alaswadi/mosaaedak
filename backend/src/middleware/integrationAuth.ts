import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settingsService.js';

export async function requireIntegrationKey(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header('X-API-Key');

    if (!apiKey) {
        res.status(401).json({ error: 'API Key required' });
        return;
    }

    try {
        const isValid = await settingsService.validateN8nApiKey(apiKey);
        if (!isValid) {
            res.status(403).json({ error: 'Invalid API Key' });
            return;
        }
        next();
    } catch (error) {
        console.error('Integration auth error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
