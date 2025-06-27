// Utilitare de securitate pentru prevenirea atacurilor XSS și validare input-uri

/**
 * Sanitizează un string pentru a preveni XSS
 * @param input - String-ul de sanitizat
 * @returns String sanitizat
 */
export const sanitizeHtml = (input: string): string => {
    if (!input) return '';
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validează un email
 * @param email - Email-ul de validat
 * @returns true dacă este valid
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
};

/**
 * Validează lungimea unui string
 * @param str - String-ul de validat
 * @param minLength - Lungimea minimă
 * @param maxLength - Lungimea maximă
 * @returns true dacă este valid
 */
export const validateStringLength = (str: string, minLength: number = 1, maxLength: number = 255): boolean => {
    return !!(str && str.trim().length >= minLength && str.trim().length <= maxLength);
};

/**
 * Validează un număr întreg pozitiv
 * @param num - Numărul de validat
 * @returns true dacă este valid
 */
export const validatePositiveInteger = (num: any): boolean => {
    const parsed = parseInt(num);
    return !isNaN(parsed) && parsed > 0 && parsed <= 2147483647; // Max PostgreSQL integer
};

/**
 * Validează un număr întreg non-negativ
 * @param num - Numărul de validat
 * @returns true dacă este valid
 */
export const validateNonNegativeInteger = (num: any): boolean => {
    const parsed = parseInt(num);
    return !isNaN(parsed) && parsed >= 0 && parsed <= 2147483647;
};

/**
 * Sanitizează și validează input-ul pentru numele categoriilor/articolelor
 * @param name - Numele de validat
 * @returns string sanitizat sau null dacă invalid
 */
export const sanitizeAndValidateName = (name: string): string | null => {
    if (!validateStringLength(name, 2, 100)) {
        return null;
    }
    // Elimină spațiile multiple și sanitizează
    const sanitized = sanitizeHtml(name.trim().replace(/\s+/g, ' '));
    return sanitized;
};

/**
 * Validează parola - cel puțin 6 caractere
 * @param password - Parola de validat
 * @returns true dacă este validă
 */
export const validatePassword = (password: string): boolean => {
    return !!(password && password.length >= 6 && password.length <= 128);
};
