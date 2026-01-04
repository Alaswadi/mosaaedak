import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { api, type User } from '../../services/api';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserUpdated: () => void;
    user: User | null;
}

export function EditUserModal({ isOpen, onClose, onUserUpdated, user }: EditUserModalProps) {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        password: '', // Optional: only if resetting
        status: 'ACTIVE',
        systemPrompt: '',
        aiModel: 'gpt-3.5-turbo',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                businessName: user.name || '', // Assuming name maps to businessName in the simplified view, but we should likely fetch full details if needed. For now using name as businessName might be ambiguous if mapped from tenant.businessName
                password: '',
                status: user.status === 'active' ? 'ACTIVE' : user.status === 'inactive' ? 'PAUSED' : 'ACTIVE', // Map to backend enum
                systemPrompt: user.systemPrompt || '',
                aiModel: user.aiModel || 'gpt-3.5-turbo',
            });
        }
    }, [user]);

    // We should probably clear form when modal closes or user changes
    useEffect(() => {
        if (!isOpen) {
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Filter out empty password if not provided
            const updateData: any = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                businessName: formData.businessName,
                status: formData.status,
                systemPrompt: formData.systemPrompt,
                aiModel: formData.aiModel,
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            await api.updateTenant(user.id, updateData);
            onUserUpdated();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {t('users.table.edit')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {t('auth.register.fullName')}
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {t('auth.register.email')}
                        </label>
                        <input
                            type="email"
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {t('auth.register.businessName')}
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {t('auth.register.phone')}
                        </label>
                        <input
                            type="tel"
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {t('users.table.status')}
                        </label>
                        <select
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="ACTIVE">{t('users.table.active')}</option>
                            <option value="PAUSED">{t('users.table.inactive')}</option>
                            <option value="BANNED">Banned</option>
                        </select>
                    </div>



                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {t('bot.aiModel')}
                        </label>
                        <select
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                            value={formData.aiModel}
                            onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                        >
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {t('auth.register.newPasswordOptional')}
                        </label>
                        <input
                            type="password"
                            minLength={8}
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={t('auth.register.passwordPlaceholder')}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                        >
                            {isLoading ? t('common.updating') : t('users.table.updateUser')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
