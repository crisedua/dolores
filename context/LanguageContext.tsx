'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, TranslationKeys } from '@/lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Default to 'es' as the app was originally in Spanish
    const [language, setLanguageState] = useState<Language>('es');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'es')) {
            setLanguageState(savedLang);
        } else {
            // Check browser preference
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'en') {
                setLanguageState('en');
            }
        }
        setMounted(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}
