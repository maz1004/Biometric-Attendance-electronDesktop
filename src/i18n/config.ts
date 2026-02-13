import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'fr',
        supportedLngs: ['en', 'fr', 'ar', 'kab'],
        debug: import.meta.env.DEV, // Enable debug only in dev mode

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
