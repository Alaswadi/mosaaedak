import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import type { PaymentTransaction } from '../services/api';

export function PaymentApprovals() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    // Pending State
    const [pendingTransactions, setPendingTransactions] = useState<PaymentTransaction[]>([]);
    const [loadingPending, setLoadingPending] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    // History State
    const [historyTransactions, setHistoryTransactions] = useState<PaymentTransaction[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);

    const { isRTL } = useLanguage();

    useEffect(() => {
        if (activeTab === 'pending') {
            loadPendingPayments();
        } else {
            loadHistoryPayments();
        }
    }, [activeTab, historyPage]);

    const loadPendingPayments = async () => {
        setLoadingPending(true);
        try {
            const data = await api.getPendingPayments(1, 50);
            setPendingTransactions(data.transactions);
        } catch (error) {
            console.error('Failed to load pending payments:', error);
        } finally {
            setLoadingPending(false);
        }
    };

    const loadHistoryPayments = async () => {
        setLoadingHistory(true);
        try {
            const data = await api.getAllPayments(historyPage, 20);
            setHistoryTransactions(data.transactions);
            setHistoryTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error('Failed to load payment history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setProcessing(id);
        try {
            await api.reviewPayment(id, status, status === 'REJECTED' ? notes : undefined);
            // Reload both to ensure consistency if switching tabs
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
                            {isRTL ? 'المدفوعات' : 'Payments'}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {activeTab === 'pending'
                                ? (isRTL ? 'مراجعة طلبات الدفع المعلقة' : 'Review pending payment requests')
                                : (isRTL ? 'سجل جميع المعاملات المالية' : 'History of all financial transactions')
                            }
                        </p>
                    </div>
                </header>

                {/* Tabs */}
                <div className="px-6 lg:px-8 pt-6">
                    <div className="border-b border-neutral-200 dark:border-neutral-700">
                        <nav className="-mb-px flex gap-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`shrink-0 border-b-2 py-4 px-1 text-sm font-medium ${activeTab === 'pending'
                                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                                    }`}
                            >
                                {isRTL ? 'معلقة' : 'Pending'}
                                {pendingTransactions.length > 0 && (
                                    <span className="ml-2 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                        {pendingTransactions.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`shrink-0 border-b-2 py-4 px-1 text-sm font-medium ${activeTab === 'history'
                                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                                    }`}
                            >
                                {isRTL ? 'السجل' : 'History'}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8">
                    {activeTab === 'pending' ? (
                        // PENDING TRANSACTIONS VIEW
                        loadingPending ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                            </div>
                        ) : pendingTransactions.length === 0 ? (
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
                                {pendingTransactions.map((tx) => (
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
                        )
                    ) : (
                        // HISTORY TABLE VIEW
                        loadingHistory ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300 font-medium border-b border-neutral-200 dark:border-neutral-600">
                                            <tr>
                                                <th className="px-6 py-4">{isRTL ? 'التاريخ' : 'Date'}</th>
                                                <th className="px-6 py-4">{isRTL ? 'العميل' : 'Customer'}</th>
                                                <th className="px-6 py-4">{isRTL ? 'المبلغ' : 'Amount'}</th>
                                                <th className="px-6 py-4">{isRTL ? 'الطريقة' : 'Method'}</th>
                                                <th className="px-6 py-4">{isRTL ? 'الحالة' : 'Status'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                            {historyTransactions.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                                        {formatDate(tx.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-neutral-900 dark:text-white">
                                                            {tx.tenant?.businessName}
                                                        </div>
                                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                            {tx.tenant?.user?.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                                                        ${Number(tx.amount).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                                        {tx.method}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                tx.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            }`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination (Simple) */}
                                {historyTotalPages > 1 && (
                                    <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-center gap-2">
                                        <button
                                            disabled={historyPage === 1}
                                            onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                            className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-3 py-1 text-neutral-600 dark:text-neutral-400">
                                            Page {historyPage} of {historyTotalPages}
                                        </span>
                                        <button
                                            disabled={historyPage >= historyTotalPages}
                                            onClick={() => setHistoryPage(p => p + 1)}
                                            className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
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
