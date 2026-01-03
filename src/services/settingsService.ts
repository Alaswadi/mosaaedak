import api from './api';

export const settingsService = {
    /**
     * Get the N8N API key
     */
    getN8nApiKey: async () => {
        return api.getN8nApiKey();
    },

    /**
     * Rotate the N8N API key
     */
    rotateN8nApiKey: async () => {
        return api.rotateN8nApiKey();
    },
};
