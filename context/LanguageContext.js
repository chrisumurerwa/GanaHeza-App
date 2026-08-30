/**
 * GanaHeza Language Context
 *
 * Provides language switching between English ('en') and Kinyarwanda ('rw').
 * The selected language is persisted in AsyncStorage.
 *
 * Usage:
 *   const { t, language, toggleLanguage } = useLanguage();
 *   t('home_hero_title')                     → plain string
 *   t('products_count', { n: 5 })            → "5 product(s) found"
 *   t('order_ordering', { qty:2, unit:'Kg', name:'Avocado' })
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/constants/translations';

const STORAGE_KEY = '@ganaheza_language';
const DEFAULT_LANG = 'en';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'en' || saved === 'rw') setLanguage(saved);
      })
      .catch(() => {/* ignore */})
      .finally(() => setReady(true));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'rw' : 'en';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const setLang = useCallback((lang) => {
    if (lang !== 'en' && lang !== 'rw') return;
    setLanguage(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
  }, []);

  /**
   * t(key, vars?)
   *   key  — key from translations.js
   *   vars — optional object of substitutions e.g. { n: 5 }
   *
   * Returns the translated string, falling back to English if Kinyarwanda
   * is missing, or the key itself if neither exists.
   */
  const t = useCallback(
    (key, vars) => {
      const entry = translations[key];
      if (!entry) {
        if (__DEV__) console.warn(`[i18n] Missing translation key: "${key}"`);
        return key;
      }
      let str = entry[language] ?? entry['en'] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return str;
    },
    [language]
  );

  // Don't render children until language is loaded from storage
  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside a LanguageProvider');
  return ctx;
}
