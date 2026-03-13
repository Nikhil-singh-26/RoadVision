import React, { createContext, useState, useEffect, useContext } from 'react';
import en from '../translations/en.json';
import hi from '../translations/hi.json';

const translations = { en, hi };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    
    // Apply font family based on language
    if (language === 'hi') {
      document.body.style.fontFamily = "'Noto Sans Devanagari', sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', sans-serif";
    }
  }, [language]);

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[language];
    
    for (const key of keys) {
      if (result[key] === undefined) {
        // Fallback to English if key missing in current language
        let fallback = translations['en'];
        for (const fKey of keys) {
          if (fallback[fKey] === undefined) return path;
          fallback = fallback[fKey];
        }
        return fallback;
      }
      result = result[key];
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
