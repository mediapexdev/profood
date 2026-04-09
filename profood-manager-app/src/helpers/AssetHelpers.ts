import i18n from "../i18n";

/**
 * 
 * @param index 
 * @returns 
 */
export const colorClassName = (index : number) => colorClassNames[index];

/**
 * 
 */
export const colorClassNames = ['danger', 'info', 'info2', 'primary', 'success', 'tertiary', 'warning'];

/**
 * Formats a given date according the current language and returns it.
 * 
 * @param date 
 * @param dateStyle 
 * @param dateSeparator 
 * @param showTime 
 * @param timeStyle 
 * @param locale 
 * @returns 
 */
export const formatDate = (date: Date,
    dateStyle: "full" | "long" | "medium" | "short" | undefined = 'full',
    dateSeparator: string = '/', showTime: boolean = false,
    timeStyle: "full" | "long" | "medium" | "short" | undefined = 'full', locale?: string) => {

    const lang = i18n.language;
    let _locale = locale === undefined ? 'fr-SN' : locale;

    if(lang === 'en'){
        _locale = 'en-SN';
    }
    const formattedDate = (!showTime)
    ?
    new Intl.DateTimeFormat(_locale, { dateStyle: dateStyle, timeZone: 'Africa/Dakar' }).format(date)
    :
    new Intl.DateTimeFormat(_locale, { dateStyle: dateStyle, timeStyle: timeStyle, timeZone: 'Africa/Dakar' }).format(date);

    return (dateSeparator === '/') ? formattedDate : formattedDate.replaceAll('/', dateSeparator)
};

/**
 * Formats a given number according the current language and returns it.
 * 
 * @param number
 * 
 * @returns number
 */
export const formatNumber = (number: number) => {

    let locale = 'fr-SN';
    const lang = i18n.language;

    if(lang === 'en'){
        locale = 'en-US';
    }
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
 * @param $nbChars 
 * @returns 
 */
export const generatePassword = (nbChars: number) => {

    const chars = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%&*()-_=+][}{.?`;
    let password = "";

    for(let i = 0; i < nbChars; i++) {
        password += chars[random(1, chars.length - 1)];
    }
    return password;
};

/**
 * 
 * @param phoneNumber 
 * @returns 
 */
export const isValidPhoneNumber = (phoneNumber: string) => phoneNumber.length > 0 && phoneNumber.match(/(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$/) !== null;

/**
 * 
 * @param email 
 * @returns 
 */
export const isValidEmail = (email: string) => email.length > 0 && email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) !== null;

/**
 * 
 * @param min 
 * @param max 
 * @returns 
 */
export const random = (min : number, max : number) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * 
 * @param order_id 
 * @returns 
 */
// export const SHA256_Encrypt = (order_id : string) => {
//     const crypto = require('crypto-js');
//     const sha256 = crypto.SHA256(order_id);
//     return sha256;
// };

/**
 * 
 * @param pathName 
 *
 * @returns string
 */
export const toAbsolutePublicUrl = (pathName: string) => process.env.PUBLIC_URL + pathName;
