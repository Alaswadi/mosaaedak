import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import type { PaymentTransaction } from '../services/api';

export function PaymentApprovals() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    const { isRTL } = useLanguage();

    useEffect(() => {
        loadPendingPayments();
    }, []);

    const loadPendingPayments = async () => {
        try {
            const data = await api.getPendingPayments(1, 50);
            setTransactions(data.transactions);
        } catch (error) {
            console.error('Failed to load pending payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setProcessing(id);
        try {
            await api.reviewPayment(id, status, status === 'REJECTED' ? notes : undefined);
            await loadPendingPayments();
            setNotes('');
        } catch (error) {
            console.error('Failed to review payment:', error);
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString(isRTL ? 'ar' : 'en');
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <main className={`min-h-screen ${isRTL ? 'lg:mr-70' : 'lg:ml-70'}`}>
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white/80 px-6 backdrop-blur-sm dark:bg-neutral-800/80 lg:px-8">
                    <div className={isRTL ? 'mr-12 lg:mr-0' : 'ml-12 lg:ml-0'}>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            {isRTL ? 'موافقات الدفع' : 'Payment Approvals'}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {isRTL ? `${transactions.length} طلب قيد الانتظار` : `${transactions.length} pending requests`}
                        </p>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 lg:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                {isRTL ? 'لا توجد طلبات معلقة' : 'No Pending Requests'}
                            </h2>
                            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                                {isRTL ? 'تم مراجعة جميع طلبات الدفع' : 'All payment requests have been reviewed'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm overflow-hidden">
                                    {/* Header */}
                                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                    {tx.tenant?.businessName || 'Unknown Business'}
                                                </h3>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    {tx.tenant?.user?.email}
                                                </p>
                                            </div>
                                            <span className="text-2xl font-bold text-primary-600">
                                                ${Number(tx.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-500 dark:text-neutral-400">
                                                {isRTL ? 'الطريقة' : 'Method'}
                                            </span>
                                            <span className="font-medium text-neutral-900 dark:text-white">
                                                {tx.method}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-500 dark:text-neutral-400">
                                                {isRTL ? 'التاريخ' : 'Date'}
                                            </span>
                                            <span className="font-medium text-neutral-900 dark:text-white">
                                                {formatDate(tx.createdAt)}
                                            </span>
                                        </div>

                                        {/* Proof Image */}
                                        {tx.proofPath && (
                                            <button
                                                onClick={() => setSelectedImage(`/api/payments/admin/proof/${tx.proofPath}`)}
                                                className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition flex items-center justify-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {isRTL ? 'عرض إثبات الدفع' : 'View Payment Proof'}
                                            </button>
                                        )}

                                        {/* Rejection Notes */}
                                        <textarea
                                            placeholder={isRTL ? 'سبب الرفض (اختياري)...' : 'Rejection reason (optional)...'}
                                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm resize-none"
                                            rows={2}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 flex gap-3">
                                        <button
                                            onClick={() => handleReview(tx.id, 'REJECTED')}
                                            disabled={processing === tx.id}
                                            className="flex-1 py-2.5 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                                        >
                                            {isRTL ? 'رفض' : 'Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleReview(tx.id, 'APPROVED')}
                                            disabled={processing === tx.id}
                                            className="flex-1 py-2.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {processing === tx.id ? (
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            ) : null}
                                            {isRTL ? 'موافقة' : 'Approve'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="max-w-4xl max-h-[90vh] overflow-auto">
                        <img
                            src={selectedImage}
                            alt="Payment proof"
                            className="rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentApprovals;
