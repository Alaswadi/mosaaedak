import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { api, type User } from '../../services/api';

interface AdminTopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

export function AdminTopUpModal({ isOpen, onClose, onSuccess, user }: AdminTopUpModalProps) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isRTL } = useLanguage();

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await api.adminTopUp(
                user.id, // User ID is same as Tenant ID in this system context usually, or we need tenantId
                parseFloat(amount),
                method,
                notes
            );
            onSuccess();
            onClose();
            // Reset form
            setAmount('');
            setMethod('CASH');
            setNotes('');
        } catch (err: any) {
            setError(err.message || 'Failed to top up wallet');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-800">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {isRTL ? 'شحن رصيد العميل' : 'Top Up Customer Wallet'}
                    </h2>
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

                <div className="mb-6 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-700/50">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {user.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {user.email}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {isRTL ? 'المبلغ ($)' : 'Amount ($)'}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-500"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Method */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                        </label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                        >
                            <option value="CASH">Cash / نقدي</option>
                            <option value="KURIMI">Kurimi / والكريمي</option>
                            <option value="USDT">USDT / عملة رقمية</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {isRTL ? 'ملاحظات' : 'Notes (Optional)'}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-500 resize-none"
                            placeholder={isRTL ? 'أي تفاصيل إضافية...' : 'Any additional details...'}
                        />
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                        >
                            {isLoading ? (isRTL ? 'جاري التنفيذ...' : 'Processing...') : (isRTL ? 'شحن الرصيد' : 'Top Up Wallet')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
