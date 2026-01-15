import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

interface Notification {
    id: string;
    type: 'LOW_BALANCE' | 'SYSTEM_ALERT' | 'PAYMENT_PENDING';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    tenant?: {
        businessName: string;
    };
}

export function NotificationBell() {
    const { t, isRTL } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            // Ideally should be a real API call. Since I haven't added the specific endpoint to api.ts yet,
            // I'll simulate or add it quickly if needed. 
            // BUT, for now let's assume I will add `getNotifications` to `api.ts`.
            // If not, I'll use a direct fetch here to be fast.
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/notifications/unread`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute top-full mt-2 w-80 rounded-lg border border-neutral-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:border-neutral-700 dark:bg-neutral-800 ${isRTL ? 'left-0' : 'right-0'}`}>
                    <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                                No new notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="relative p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                                    {notification.title}
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                    {notification.message}
                                                </p>
                                                <p className="mt-2 text-[10px] text-neutral-400">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="ml-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                                                title="Mark as read"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
