'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { translations, type Language } from '@/lib/translations';

/**
 * Custom hook to manage application-wide translations.
 * It synchronizes with Firestore for logged-in users and localStorage for persistence.
 */
export const useTranslation = () => {
  const { progress } = useStore();
  const [localLang, setLocalLang] = useState<Language>('en');

  useEffect(() => {
    // Check localStorage on mount
    const saved = localStorage.getItem('shikshasetu_lang') as Language;
    if (saved && ['en', 'hi', 'kn'].includes(saved)) {
      setLocalLang(saved);
    }
  }, []);

  // Sync state if localStorage changes in other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'shikshasetu_lang' && e.newValue) {
        setLocalLang(e.newValue as Language);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Preferred order: Remote (Firestore) -> Local (State/Storage) -> Default
  // We prioritize state/local for instant UI updates, then sync from Firestore if available
  const lang = (progress?.languagePreference as Language) || localLang || 'en';
  const t = translations[lang] || translations.en;

  return { t, lang };
};
