import prisma from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class SettingsService {
    private readonly N8N_API_KEY = 'N8N_API_KEY';

    /**
     * Get the N8N integration API key
     * Generates one if it doesn't exist
     */
    async getN8nApiKey(): Promise<string> {
        let setting = await prisma.systemSetting.findUnique({
            where: { key: this.N8N_API_KEY },
        });

        if (!setting) {
            // Generate new key if not exists
            const newKey = `sk_${uuidv4().replace(/-/g, '')}`; // looks like sk_...
            setting = await prisma.systemSetting.create({
                data: {
                    key: this.N8N_API_KEY,
                    value: newKey,
                },
            });
        }

        return setting.value;
    }

    /**
     * Rotate (regenerate) the N8N API key
     */
    async rotateN8nApiKey(): Promise<string> {
        const newKey = `sk_${uuidv4().replace(/-/g, '')}`;

        const setting = await prisma.systemSetting.upsert({
            where: { key: this.N8N_API_KEY },
            update: { value: newKey },
            create: {
                key: this.N8N_API_KEY,
                value: newKey,
            },
        });

        return setting.value;
    }

    /**
     * Validate an API key
     */
    async validateN8nApiKey(apiKey: string): Promise<boolean> {
        const currentKey = await this.getN8nApiKey();
        return currentKey === apiKey;
    }
}

export const settingsService = new SettingsService();
