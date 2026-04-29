'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { translations, type Language } from '@/lib/translations';

/**
 * Custom hook to manage application-wide translations.
 * It synchronizes with Firestore for logged-in users and localStorage for guests.
 */
export const useTranslation = () => {
  const { progress } = useStore();
  const [localLang, setLocalLang] = useState<Language>('en');

  useEffect(() => {
    // Check localStorage on mount for guest users
    const saved = localStorage.getItem('shikshasetu_lang') as Language;
    if (saved && ['en', 'hi', 'kn'].includes(saved)) {
      setLocalLang(saved);
    }
  }, []);

  // Preferred order: Firestore -> LocalStorage -> Default (en)
  const lang = (progress?.languagePreference as Language) || localLang || 'en';
  const t = translations[lang] || translations.en;

  return { t, lang };
};
