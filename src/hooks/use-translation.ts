
'use client';

import { useStore } from '@/lib/store';
import { translations, type Language } from '@/lib/translations';

export const useTranslation = () => {
  const { progress } = useStore();
  const lang = (progress?.languagePreference as Language) || 'en';

  const t = translations[lang] || translations.en;

  return { t, lang };
};
