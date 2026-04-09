import i18n from "../i18n";

/**
 * Formats a given date according the current language and returns it.
 * 
 * @param date 
 * @returns 
 */
export const formatDate = (date: Date,
    dateStyle : "full" | "long" | "medium" | "short" | undefined = 'full',
    showTime = false,
    timeStyle : "full" | "long" | "medium" | "short" | undefined = 'full') => {
    /**
     * 
     */
    const lang = i18n.language;

    /**
     * 
     */
    let locale = 'fr-SN';

    /**
     * 
     */
    if(lang === 'en'){
        locale = 'en-SN';
    }

    /**
     * 
     */
    return (!showTime) ?
            new Intl.DateTimeFormat(locale, { dateStyle: dateStyle, timeZone: 'Africa/Dakar' }).format(date)
            :
            new Intl.DateTimeFormat(locale, { dateStyle: dateStyle, timeStyle: timeStyle, timeZone: 'Africa/Dakar' }).format(date);
};

/**
 * Formats a given number according the current language and returns it.
 * 
 * @param number
 * 
 * @returns number
 */
export const formatNumber = (number: number) => {
    /**
     * 
     */
    const lang = i18n.language;

    /**
     * 
     */
    let locale = 'fr-SN';

    /**
     * 
     */
    if(lang === 'en'){
        locale = 'en-US';
    }
    /**
     * 
     */
    return new Intl.NumberFormat(locale).format(number);
};

/**
 * Formats a given phone number and returns it.
 * 
 * @param phoneNumber 
 *
 * @returns string
 */
export const formatPhoneNumber = (phoneNumber: string) => phoneNumber.replace(/\s+/g, '').replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');

/**
 * 
 * @param order_id 
 * @returns 
 */
export const SHA256_Encrypt = (order_id : string) => {
    const crypto = require('crypto-js');
    const sha256 = crypto.SHA256(order_id);
    return sha256;
};

/**
 *
 * @param pathName
 *
 * @returns string
 */
export const toAbsolutePublicUrl = (pathName: string) => process.env.PUBLIC_URL + pathName;

/**
 * Normalizes a string by removing accents and converting to lowercase.
 * Useful for search functionality to match "bœuf" with "boeuf".
 *
 * @param str - The string to normalize
 * @returns The normalized string without accents
 */
export const normalizeString = (str: string): string => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};
