import i18n from 'i18next';
import  Backend from 'i18next-http-backend';
import LanguageDetector  from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';
import translationEN from './locales/languages/en.json'; 
import translationFR from './locales/languages/fr.json'; 

/**
 * 
 */
const defaultLang = localStorage.getItem('lang');

/**
 * 
 */
i18n
.use(Backend)
.use(LanguageDetector)
.use(initReactI18next)
.init({
    fallbackLng: (defaultLang === 'en' || defaultLang === 'fr') ? defaultLang : 'fr',
    debug: true,
    detection: {
        order: ['queryString', 'cookie']
    },
    interpolation: {
        escapeValue: false // React already safes from xss
    },
    resources: {
        en: {
            translation: translationEN
        },
        fr: {
            translation: translationFR
        }
    }
});

export default i18n;
