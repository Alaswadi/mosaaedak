import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import ThemeSwitch from './ThemeSwitch';

// Icon components for navigation items
function DashboardIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    );
}

function WalletIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
}

function BotIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

function ChatIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

function PaymentsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function ChartIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}

function LogoutIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    );
}

function MenuIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function CloseIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

function LanguageIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
    );
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
    dashboard: DashboardIcon,
    wallet: WalletIcon,
    bot: BotIcon,
    chat: ChatIcon,
    users: UsersIcon,
    payments: PaymentsIcon,
    chart: ChartIcon,
};

// Admin navigation items
const adminNavItems = [
    { id: 'dashboard', label: { en: 'Dashboard', ar: 'لوحة التحكم' }, icon: 'dashboard', path: '/dashboard' },
    { id: 'users', label: { en: 'Tenants', ar: 'العملاء' }, icon: 'users', path: '/users' },
    { id: 'payments', label: { en: 'Payments', ar: 'المدفوعات' }, icon: 'payments', path: '/payments' },
];

// Customer navigation items
const customerNavItems = [
    { id: 'dashboard', label: { en: 'Dashboard', ar: 'لوحة التحكم' }, icon: 'dashboard', path: '/customer/dashboard' },
    { id: 'topup', label: { en: 'Top Up', ar: 'شحن الرصيد' }, icon: 'wallet', path: '/customer/topup' },
];

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { language, toggleLanguage, isRTL } = useLanguage();
    const { user, tenant, logout, isAdmin } = useAuth();

    const navItems = isAdmin ? adminNavItems : customerNavItems;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={onToggle}
                className={`fixed top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-lg lg:hidden dark:bg-neutral-800 dark:text-neutral-300 ${isRTL ? 'right-4' : 'left-4'}`}
                aria-label="Toggle menu"
            >
                {isOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onToggle}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 z-40 flex h-screen w-70 flex-col bg-white transition-transform duration-300 dark:bg-neutral-800 lg:translate-x-0 ${isRTL
                    ? `right-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
                    : `left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
                    }`}
            >
                {/* Logo */}
                <div className="flex h-20 items-center gap-3 border-b border-neutral-200 px-6 dark:border-neutral-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
                        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">mosaaedak</span>
                        {isAdmin && (
                            <span className="block text-xs text-neutral-500 dark:text-neutral-400">Admin Panel</span>
                        )}
                    </div>
                </div>

                {/* User Info (Customer only) */}
                {!isAdmin && tenant && (
                    <div className="border-b border-neutral-200 p-4 dark:border-neutral-700">
                        <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 p-3 text-white">
                            <p className="text-xs opacity-80">{isRTL ? 'الرصيد' : 'Balance'}</p>
                            <p className="text-xl font-bold">${Number(tenant.walletBalance || 0).toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = iconMap[item.icon];
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => isOpen && onToggle()}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                                    ? `${isRTL ? 'border-r-4' : 'border-l-4'} border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400`
                                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                    }`}
                            >
                                {Icon && <Icon className="h-5 w-5" />}
                                {language === 'ar' ? item.label.ar : item.label.en}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
                    {/* User Name */}
                    <div className="mb-4 text-center">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {user?.name || (isRTL ? 'المستخدم' : 'User')}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {user?.email}
                        </p>
                    </div>

                    {/* Language Switch */}
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            {isRTL ? 'اللغة' : 'Language'}
                        </span>
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                        >
                            <LanguageIcon className="h-4 w-4" />
                            {language === 'en' ? 'العربية' : 'English'}
                        </button>
                    </div>

                    {/* Theme Switch */}
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            {isRTL ? 'المظهر' : 'Theme'}
                        </span>
                        <ThemeSwitch />
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600"
                    >
                        <LogoutIcon className="h-5 w-5" />
                        {isRTL ? 'تسجيل خروج' : 'Log Out'}
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
