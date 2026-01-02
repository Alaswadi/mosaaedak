import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

type Language = 'en' | 'ar';
type Translations = typeof enTranslations;

interface LanguageContextType {
    language: Language;
    isRTL: boolean;
    t: (key: string) => string;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
}

const translations: Record<Language, Translations> = {
    en: enTranslations,
    ar: arTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(() => {
        // Check localStorage for saved preference
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('language') as Language;
            if (saved && (saved === 'en' || saved === 'ar')) {
                return saved;
            }
        }
        return 'en';
    });

    const isRTL = language === 'ar';

    // Update document direction when language changes
    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;

        // Add/remove font class for Arabic
        if (isRTL) {
            document.documentElement.classList.add('font-arabic');
        } else {
            document.documentElement.classList.remove('font-arabic');
        }

        // Save to localStorage
        localStorage.setItem('language', language);
    }, [language, isRTL]);

    // Translation function - supports nested keys like "nav.dashboard"
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: unknown = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        return typeof value === 'string' ? value : key;
    };

    const toggleLanguage = () => {
        setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, isRTL, t, toggleLanguage, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
