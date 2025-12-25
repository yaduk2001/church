'use client';

import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function HtmlLangSetter() {
    const { language } = useLanguage();

    useEffect(() => {
        // Update the html lang attribute when language changes
        document.documentElement.lang = language;
    }, [language]);

    return null; // This component doesn't render anything
}
