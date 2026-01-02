import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {isRTL ? 'مساعدك' : 'Mosaaedak'}
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                            {isRTL ? 'تسجيل الدخول إلى حسابك' : 'Sign in to your account'}
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : ''}`}
                            >
                                {isRTL ? 'البريد الإلكتروني' : 'Email'}
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={`w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${isRTL ? 'text-right' : ''}`}
                                placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : ''}`}
                            >
                                {isRTL ? 'كلمة المرور' : 'Password'}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={`w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${isRTL ? 'text-right' : ''}`}
                                placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? (isRTL ? 'جاري التحميل...' : 'Loading...')
                                : (isRTL ? 'تسجيل الدخول' : 'Sign In')
                            }
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
}

export default Login;
