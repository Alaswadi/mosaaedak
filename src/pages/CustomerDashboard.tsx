import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { UsageLog } from '../services/api';

interface Stats {
    totalMessages: number;
    inboundMessages: number;
    outboundMessages: number;
    totalCost: number;
}

export function CustomerDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
    const [loading, setLoading] = useState(true);

    const { isRTL } = useLanguage();
    const { tenant, refreshTenant } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, logsData] = await Promise.all([
                api.getTenantStats(30),
                api.getUsageLogs(1, 10),
            ]);
            setStats(statsData);
            setRecentLogs(logsData.logs);
            await refreshTenant();
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'PAUSED': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'BANNED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-neutral-100 text-neutral-700';
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
                            {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {isRTL ? `مرحباً، ${tenant?.businessName || ''}` : `Welcome, ${tenant?.businessName || ''}`}
                        </p>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 lg:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Wallet Card - Prominent */}
                            <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white shadow-lg">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <p className="text-primary-100 text-sm">
                                            {isRTL ? 'الرصيد المتاح' : 'Available Balance'}
                                        </p>
                                        <p className="text-4xl font-bold mt-1">
                                            {formatCurrency(Number(tenant?.walletBalance || 0))}
                                        </p>
                                        <div className="mt-2 flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant?.status || '')}`}>
                                                {tenant?.status === 'ACTIVE' ? (isRTL ? 'نشط' : 'Active') :
                                                    tenant?.status === 'PAUSED' ? (isRTL ? 'متوقف' : 'Paused') :
                                                        (isRTL ? 'محظور' : 'Banned')}
                                            </span>
                                            {tenant?.nextBillingDate && (
                                                <span className="text-primary-100 text-xs">
                                                    {isRTL ? 'التجديد: ' : 'Next billing: '}
                                                    {new Date(tenant.nextBillingDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        to="/customer/topup"
                                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition shadow-md"
                                    >
                                        <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        {isRTL ? 'شحن الرصيد' : 'Top Up'}
                                    </Link>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                                <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {isRTL ? 'إجمالي الرسائل' : 'Total Messages'}
                                            </p>
                                            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                                                {stats?.totalMessages || 0}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {isRTL ? 'الرسائل الواردة' : 'Inbound'}
                                            </p>
                                            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                                                {stats?.inboundMessages || 0}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {isRTL ? 'الرسائل الصادرة' : 'Outbound'}
                                            </p>
                                            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                                                {stats?.outboundMessages || 0}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {isRTL ? 'إجمالي التكلفة' : 'Total Cost'}
                                            </p>
                                            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                                                {formatCurrency(stats?.totalCost || 0)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid gap-6 md:grid-cols-2 mb-6">
                                <Link
                                    to="/customer/bot-config"
                                    className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm hover:shadow-md transition group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 transition">
                                                {isRTL ? 'إعدادات الروبوت' : 'Bot Configuration'}
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {isRTL ? 'تخصيص تعليمات الذكاء الاصطناعي' : 'Customize AI instructions'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/customer/history"
                                    className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm hover:shadow-md transition group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 transition">
                                                {isRTL ? 'سجل المحادثات' : 'Conversation History'}
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {isRTL ? 'عرض جميع الرسائل السابقة' : 'View all past messages'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Recent Activity */}
                            <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm">
                                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        {isRTL ? 'آخر الرسائل' : 'Recent Messages'}
                                    </h2>
                                </div>
                                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {recentLogs.length === 0 ? (
                                        <div className="p-6 text-center text-neutral-500 dark:text-neutral-400">
                                            {isRTL ? 'لا توجد رسائل بعد' : 'No messages yet'}
                                        </div>
                                    ) : (
                                        recentLogs.slice(0, 5).map((log) => (
                                            <div key={log.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition">
                                                <div className={`flex flex-col gap-1 ${log.direction === 'INBOUND' ? 'items-start' : 'items-end'}`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.direction === 'INBOUND'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            }`}>
                                                            {log.direction === 'INBOUND'
                                                                ? (log.fromPhone || (isRTL ? 'مستخدم' : 'User'))
                                                                : (isRTL ? 'المساعد الذكي' : 'Assistant')}
                                                        </span>
                                                        <span className="text-xs text-neutral-400">
                                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${log.direction === 'INBOUND'
                                                        ? 'bg-white border border-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white rounded-tl-none'
                                                        : 'bg-primary-50 text-neutral-900 dark:bg-primary-900/20 dark:text-white rounded-tr-none'
                                                        }`}>
                                                        <p className="whitespace-pre-wrap break-words">{log.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {recentLogs.length > 0 && (
                                    <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                                        <Link
                                            to="/customer/history"
                                            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                                        >
                                            {isRTL ? 'عرض جميع الرسائل ←' : 'View all messages →'}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default CustomerDashboard;
