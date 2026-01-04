import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';


export function BotConfig() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(!!userId);

    const quillRef = useRef<ReactQuill>(null);
    const { isRTL } = useLanguage();
    const { tenant, refreshTenant, isAdmin } = useAuth();

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (file && userId) {
                try {
                    const res = await api.uploadTenantImage(userId, file);
                    const quill = quillRef.current?.getEditor();
                    const range = quill?.getSelection(true);
                    if (quill && range) {
                        // Insert link instead of image embed as requested
                        quill.insertText(range.index, res.url, 'link', res.url);
                    }
                } catch (err: any) {
                    setError('Failed to upload image');
                    console.error(err);
                }
            }
        };
    }, [userId]);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), [imageHandler]);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent',
        'link', 'image'
    ];

    // Fetch tenant details if admin viewing specific user
    useEffect(() => {
        const fetchTenantDetails = async () => {
            if (userId && isAdmin) {
                try {
                    setLoading(true);
                    const data = await api.getTenantDetails(userId);
                    setSystemPrompt(data.systemPrompt || '');
                } catch (err: any) {
                    setError('Failed to load tenant details');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else if (!isAdmin && tenant) {
                // If somehow accessed by customer (though link is removed), redirect or load own
                // But simplified requirement is admin-only page "like this". 
                // We'll keep this logic just in case for now, but focus on admin.
                navigate('/customer/dashboard');
            }
        };

        fetchTenantDetails();
    }, [userId, isAdmin, tenant, navigate]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            if (userId && isAdmin) {
                // Admin updating customer bot
                await api.updateTenant(userId, { systemPrompt });
            } else {
                // Fallback (shouldn't be reached given new requirements)
                await api.updateBotConfig(systemPrompt);
                await refreshTenant();
            }
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const promptTemplates = [
        {
            titleEn: 'Customer Service',
            titleAr: 'خدمة العملاء',
            promptEn: `You are a helpful customer service assistant for our business. Be friendly, professional, and helpful. Answer questions about our products and services. If you don't know something, politely say so and offer to connect the customer with a human agent.`,
            promptAr: `أنت مساعد خدمة عملاء ودود ومحترف. أجب على أسئلة العملاء حول منتجاتنا وخدماتنا بشكل مفيد. إذا لم تعرف شيئاً، قل ذلك بلطف واعرض توصيل العميل بموظف بشري.`,
        },
        {
            titleEn: 'Sales Assistant',
            titleAr: 'مساعد مبيعات',
            promptEn: `You are a sales assistant. Help customers find the right products, provide pricing information, and guide them through the purchase process. Be persuasive but not pushy. Always highlight the value proposition.`,
            promptAr: `أنت مساعد مبيعات. ساعد العملاء في إيجاد المنتجات المناسبة، وقدم معلومات الأسعار، وأرشدهم خلال عملية الشراء. كن مقنعاً ولكن ليس ملحاً.`,
        },
        {
            titleEn: 'Appointment Booking',
            titleAr: 'حجز المواعيد',
            promptEn: `You are an appointment booking assistant. Help customers schedule appointments, check availability, and provide booking confirmations. Ask for necessary details like name, preferred date/time, and contact information.`,
            promptAr: `أنت مساعد حجز مواعيد. ساعد العملاء في جدولة المواعيد، والتحقق من التوفر، وتقديم تأكيدات الحجز. اسأل عن التفاصيل الضرورية مثل الاسم والتاريخ/الوقت المفضل ومعلومات الاتصال.`,
        },
    ];

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <main className={`min-h-screen ${isRTL ? 'lg:mr-70' : 'lg:ml-70'}`}>
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white/80 px-6 backdrop-blur-sm dark:bg-neutral-800/80 lg:px-8">
                    <div className={isRTL ? 'mr-12 lg:mr-0' : 'ml-12 lg:ml-0'}>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            {isRTL ? 'إعدادات الروبوت' : 'Bot Configuration'}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {isRTL ? 'تخصيص سلوك الذكاء الاصطناعي' : 'Customize AI behavior'}
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </header>

                {/* Content */}
                <div className="p-6 lg:p-8">
                    {success && (
                        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-600 dark:text-green-400">
                                {isRTL ? '✅ تم حفظ الإعدادات بنجاح!' : '✅ Configuration saved successfully!'}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* System Prompt - Full Width if Admin, else 2/3 */}
                            <div className="lg:col-span-3 space-y-6">
                                <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                                        {isRTL ? 'تعليمات النظام (System Prompt)' : 'System Prompt'}
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                        {isRTL
                                            ? 'هذه التعليمات تحدد شخصية وسلوك الروبوت الخاص بك. اكتب بوضوح ما تريد أن يفعله الروبوت.'
                                            : 'These instructions define your bot\'s personality and behavior. Clearly describe what you want your bot to do.'}
                                    </p>
                                    <div className="prose-editor">
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={systemPrompt}
                                            onChange={setSystemPrompt}
                                            modules={modules}
                                            formats={formats}
                                            className="bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg [&_.ql-editor]:min-h-[500px]"
                                            placeholder={isRTL
                                                ? 'اكتب تعليمات الروبوت هنا...'
                                                : 'Enter your bot instructions here...'}
                                        />
                                    </div>
                                </div>

                                {/* Templates */}
                                <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                                        {isRTL ? 'قوالب جاهزة' : 'Quick Templates'}
                                    </h2>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {promptTemplates.map((template, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSystemPrompt(isRTL ? template.promptAr : template.promptEn)}
                                                className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition text-left"
                                            >
                                                <p className="font-medium text-neutral-900 dark:text-white">
                                                    {isRTL ? template.titleAr : template.titleEn}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                    {isRTL ? 'انقر للتطبيق' : 'Click to apply'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tips */}
                                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 p-6">
                                    <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">
                                        💡 {isRTL ? 'نصائح' : 'Tips'}
                                    </h3>
                                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-2">
                                        <li>• {isRTL ? 'كن محدداً في التعليمات' : 'Be specific in your instructions'}</li>
                                        <li>• {isRTL ? 'حدد نبرة الروبوت (رسمية/ودية)' : 'Define the bot\'s tone (formal/friendly)'}</li>
                                        <li>• {isRTL ? 'اذكر ما لا يجب فعله' : 'Mention what NOT to do'}</li>
                                        <li>• {isRTL ? 'يمكنك استخدام القوالب أعلاه كنقطة بداية' : 'You can use the templates above as a starting point'}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default BotConfig;
