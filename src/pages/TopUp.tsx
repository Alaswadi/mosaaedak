import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { PaymentTransaction } from '../services/api';

const PAYMENT_METHODS = [
    { id: 'KURIMI', nameEn: 'Kurimi', nameAr: 'كريمي', icon: '🏦' },
    { id: 'USDT', nameEn: 'USDT (Crypto)', nameAr: 'USDT (عملة رقمية)', icon: '💰' },
    { id: 'CASH', nameEn: 'Cash', nameAr: 'نقداً', icon: '💵' },
];

const KURIMI_NUMBER = '77X XXX XXXX'; // Replace with actual number

export function TopUp() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('KURIMI');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

    const { isRTL } = useLanguage();
    const { tenant, refreshTenant } = useAuth();

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await api.getPaymentHistory(1, 10);
            setTransactions(data.transactions);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!amount || parseFloat(amount) < 5) {
            setError(isRTL ? 'الحد الأدنى للشحن هو $5' : 'Minimum top-up is $5');
            return;
        }

        if (!proofFile) {
            setError(isRTL ? 'يرجى رفع إثبات الدفع' : 'Please upload payment proof');
            return;
        }

        setLoading(true);

        try {
            await api.requestTopUp(parseFloat(amount), method, proofFile);
            setSuccess(true);
            setAmount('');
            setProofFile(null);
            await loadTransactions();
            await refreshTenant();
        } catch (err: any) {
            setError(err.message || 'Failed to submit top-up request');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'APPROVED':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'REJECTED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-neutral-100 text-neutral-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return isRTL ? 'قيد الانتظار' : 'Pending';
            case 'APPROVED': return isRTL ? 'تمت الموافقة' : 'Approved';
            case 'REJECTED': return isRTL ? 'مرفوض' : 'Rejected';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <main className={`min-h-screen ${isRTL ? 'lg:mr-70' : 'lg:ml-70'}`}>
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white/80 px-6 backdrop-blur-sm dark:bg-neutral-800/80 lg:px-8">
                    <div className={isRTL ? 'mr-12 lg:mr-0' : 'ml-12 lg:ml-0'}>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            {isRTL ? 'شحن الرصيد' : 'Top Up Balance'}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {isRTL ? 'الرصيد الحالي: ' : 'Current balance: '}
                            <span className="font-semibold text-primary-600">${Number(tenant?.walletBalance || 0).toFixed(2)}</span>
                        </p>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 lg:p-8">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Top Up Form */}
                        <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
                                {isRTL ? 'طلب شحن جديد' : 'New Top-Up Request'}
                            </h2>

                            {success && (
                                <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        {isRTL
                                            ? '✅ تم إرسال طلب الشحن بنجاح! سيتم مراجعته قريباً.'
                                            : '✅ Top-up request submitted! It will be reviewed shortly.'}
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Amount */}
                                <div>
                                    <label className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                                        {isRTL ? 'المبلغ (بالدولار)' : 'Amount (USD)'}
                                    </label>
                                    <div className="relative">
                                        <span className={`absolute top-1/2 -translate-y-1/2 text-neutral-500 ${isRTL ? 'right-4' : 'left-4'}`}>$</span>
                                        <input
                                            type="number"
                                            min="5"
                                            step="1"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className={`w-full py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
                                            placeholder={isRTL ? 'أدخل المبلغ' : 'Enter amount'}
                                        />
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {isRTL ? 'الحد الأدنى: $5' : 'Minimum: $5'}
                                    </p>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                                        {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {PAYMENT_METHODS.map((pm) => (
                                            <button
                                                key={pm.id}
                                                type="button"
                                                onClick={() => setMethod(pm.id)}
                                                className={`p-4 rounded-lg border-2 transition ${method === pm.id
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-neutral-200 dark:border-neutral-600 hover:border-primary-300'
                                                    }`}
                                            >
                                                <span className="text-2xl">{pm.icon}</span>
                                                <p className="text-xs mt-2 text-neutral-700 dark:text-neutral-300">
                                                    {isRTL ? pm.nameAr : pm.nameEn}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Instructions */}
                                {method === 'KURIMI' && (
                                    <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                                        <p className="text-sm text-primary-700 dark:text-primary-300">
                                            {isRTL ? 'أرسل المبلغ إلى رقم كريمي:' : 'Send the amount to Kurimi number:'}
                                        </p>
                                        <p className="text-lg font-bold text-primary-600 mt-1" dir="ltr">{KURIMI_NUMBER}</p>
                                    </div>
                                )}

                                {/* Proof Upload */}
                                <div>
                                    <label className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                                        {isRTL ? 'إثبات الدفع (صورة)' : 'Payment Proof (Screenshot)'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                            className="w-full py-3 px-4 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 dark:file:bg-primary-900/30 dark:file:text-primary-300"
                                        />
                                    </div>
                                    {proofFile && (
                                        <p className="text-xs text-green-600 mt-1">
                                            ✓ {proofFile.name}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? (isRTL ? 'جاري الإرسال...' : 'Submitting...')
                                        : (isRTL ? 'إرسال طلب الشحن' : 'Submit Top-Up Request')}
                                </button>
                            </form>
                        </div>

                        {/* Transaction History */}
                        <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm">
                            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    {isRTL ? 'سجل المعاملات' : 'Transaction History'}
                                </h2>
                            </div>
                            <div className="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-[500px] overflow-y-auto">
                                {transactions.length === 0 ? (
                                    <div className="p-6 text-center text-neutral-500 dark:text-neutral-400">
                                        {isRTL ? 'لا توجد معاملات بعد' : 'No transactions yet'}
                                    </div>
                                ) : (
                                    transactions.map((tx) => (
                                        <div key={tx.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">
                                                        ${Number(tx.amount).toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                        {tx.method} • {new Date(tx.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                                                    {getStatusText(tx.status)}
                                                </span>
                                            </div>
                                            {tx.status === 'REJECTED' && tx.rejectionNotes && (
                                                <p className="text-xs text-red-500 mt-2">
                                                    {isRTL ? 'السبب: ' : 'Reason: '}{tx.rejectionNotes}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TopUp;
