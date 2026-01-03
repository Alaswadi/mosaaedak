import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { settingsService } from '../services/settingsService';
import { Sidebar } from '../components/Sidebar';

export default function Settings() {
    const { isRTL, language } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [apiKey, setApiKey] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRotating, setIsRotating] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    // Translations
    const t = {
        title: { en: 'Settings', ar: 'الإعدادات' },
        apiSection: { en: 'API Integrations', ar: 'تكامل API' },
        n8nKey: { en: 'N8N API Key', ar: 'مفتاح N8N API' },
        n8nDescription: {
            en: 'Use this key to authenticate requests from your n8n workflows.',
            ar: 'استخدم هذا المفتاح للمصادقة على الطلبات من سير عمل n8n الخاص بك.'
        },
        copy: { en: 'Copy', ar: 'نسخ' },
        copied: { en: 'Copied!', ar: 'تم النسخ!' },
        reveal: { en: 'Reveal', ar: 'إظهار' },
        hide: { en: 'Hide', ar: 'إخفاء' },
        rotate: { en: 'Regenerate Key', ar: 'تجديد المفتاح' },
        rotateWarning: {
            en: 'Warning: Regenerating the key will stop all existing integrations until they are updated with the new key.',
            ar: 'تحذير: سيؤدي تجديد المفتاح إلى إيقاف جميع عمليات التكامل الحالية حتى يتم تحديثها بالمفتاح الجديد.'
        },
        confirmRotate: { en: 'Are you sure you want to regenerate the API key?', ar: 'هل أنت متأكد من رغبتك في تجديد مفتاح API؟' },
        cancel: { en: 'Cancel', ar: 'إلغاء' },
        confirm: { en: 'Yes, Regenerate', ar: 'نعم، تجديد' }
    };

    useEffect(() => {
        fetchApiKey();
    }, []);

    const fetchApiKey = async () => {
        try {
            setIsLoading(true);
            const data = await settingsService.getN8nApiKey();
            setApiKey(data.apiKey);
        } catch (error) {
            console.error('Failed to fetch API key:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(apiKey);
            setCopySuccess(language === 'en' ? 'Copied!' : 'تم النسخ!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleRotate = async () => {
        if (!window.confirm(language === 'en' ? t.confirmRotate.en : t.confirmRotate.ar)) {
            return;
        }

        try {
            setIsRotating(true);
            const data = await settingsService.rotateN8nApiKey();
            setApiKey(data.apiKey);
            setCopySuccess(language === 'en' ? 'Key Regenerated!' : 'تم تجديد المفتاح!');
            setTimeout(() => setCopySuccess(''), 3000);
        } catch (error) {
            console.error('Failed to rotate API key:', error);
        } finally {
            setIsRotating(false);
        }
    };

    return (
        <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-900 ${isRTL ? 'rtl' : 'ltr'}`}>
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <div className={`transition-all duration-300 ${isRTL ? 'lg:mr-70' : 'lg:ml-70'}`}>
                <main className="p-4 lg:p-8">
                    <div className="mx-auto max-w-4xl">
                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {language === 'en' ? t.title.en : t.title.ar}
                                </h1>
                            </div>
                        </div>

                        {/* API Key Card */}
                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                {language === 'en' ? t.apiSection.en : t.apiSection.ar}
                            </h2>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    {language === 'en' ? t.n8nKey.en : t.n8nKey.ar}
                                </label>

                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                    {language === 'en' ? t.n8nDescription.en : t.n8nDescription.ar}
                                </p>

                                {isLoading ? (
                                    <div className="h-10 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-grow">
                                            <input
                                                type={showKey ? "text" : "password"}
                                                readOnly
                                                value={apiKey}
                                                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                                            />
                                            <button
                                                onClick={() => setShowKey(!showKey)}
                                                className={`absolute top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 ${isRTL ? 'left-3' : 'right-3'}`}
                                            >
                                                {showKey ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleCopy}
                                            className="flex items-center justify-center gap-2 rounded-lg bg-white border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-600 transition-colors"
                                        >
                                            {copySuccess ? (
                                                <span className="text-green-600 dark:text-green-400 font-bold">{copySuccess}</span>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                                    </svg>
                                                    {language === 'en' ? t.copy.en : t.copy.ar}
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={handleRotate}
                                            disabled={isRotating}
                                            className="flex items-center justify-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            {isRotating ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                </svg>
                                            )}
                                            {language === 'en' ? t.rotate.en : t.rotate.ar}
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50">
                                    <div className="flex gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600 dark:text-yellow-500 shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            {language === 'en' ? t.rotateWarning.en : t.rotateWarning.ar}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
