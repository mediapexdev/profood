import 'i18next';

declare module 'i18next' {
    interface CustomTypeOptions {
        returnNull: false;
        defaultNS: 'translation';
        resources: {
            translation: Record<string, string>;
        };
    }
}
