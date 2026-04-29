'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { translations, type Language } from '@/lib/translations';

/**
 * Custom hook to manage application-wide translations.
 * It synchronizes with Firestore for logged-in users and localStorage/events for instant updates.
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

  // Sync state if custom event is fired in the same tab
  useEffect(() => {
    const handleCustomEvent = (e: any) => {
      if (e.detail && ['en', 'hi', 'kn'].includes(e.detail)) {
        setLocalLang(e.detail);
      }
    };
    window.addEventListener('shikshasetu_lang_change', handleCustomEvent);
    return () => window.removeEventListener('shikshasetu_lang_change', handleCustomEvent);
  }, []);

  // Preferred order: Remote (Firestore) -> Local (State/Storage) -> Default
  const lang = (progress?.languagePreference as Language) || localLang || 'en';
  const t = translations[lang] || translations.en;

  return { t, lang };
};
