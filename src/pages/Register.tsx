import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError(isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await register(formData.email, formData.password, formData.name, formData.businessName);
            navigate('/customer/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${isRTL ? 'text-right' : ''}`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-4 py-8">
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
                            {isRTL ? 'إنشاء حساب جديد' : 'Create Account'}
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                            {isRTL ? 'ابدأ رحلتك مع مساعدك' : 'Start your journey with Mosaaedak'}
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                                {isRTL ? 'الاسم الكامل' : 'Full Name'}
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                                {isRTL ? 'اسم النشاط التجاري' : 'Business Name'}
                            </label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder={isRTL ? 'أدخل اسم نشاطك التجاري' : 'Enter your business name'}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                                {isRTL ? 'البريد الإلكتروني' : 'Email'}
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                                {isRTL ? 'كلمة المرور' : 'Password'}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder={isRTL ? '8 أحرف على الأقل' : 'At least 8 characters'}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                                {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? (isRTL ? 'جاري التسجيل...' : 'Creating account...')
                                : (isRTL ? 'إنشاء الحساب' : 'Create Account')
                            }
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className={`mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400`}>
                        {isRTL ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                        <Link
                            to="/login"
                            className="text-primary-600 hover:text-primary-500 font-medium"
                        >
                            {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
