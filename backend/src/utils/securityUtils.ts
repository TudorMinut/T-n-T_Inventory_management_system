// Utilitare de securitate pentru prevenirea atacurilor XSS si validare input-uri

/**
 * Sanitizeaza un string pentru a preveni XSS
 * @param input - 
 * @returns 
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
 * Valideaza un email
 * @param email 
 * @returns 
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
};

/**
 * Valideaza lungimea unui string
 * @param str 
 * @param minLength 
 * @param maxLength
 * @returns 
 */
export const validateStringLength = (str: string, minLength: number = 1, maxLength: number = 255): boolean => {
    return !!(str && str.trim().length >= minLength && str.trim().length <= maxLength);
};

/**
 * Valideaza un numar intreg pozitiv
 * @param num -
 * @returns 
 */
export const validatePositiveInteger = (num: any): boolean => {
    const parsed = parseInt(num);
    return !isNaN(parsed) && parsed > 0 && parsed <= 2147483647; // Max PostgreSQL integer
};

/**
 * Valideaza un numar intreg non-negativ
 */
export const validateNonNegativeInteger = (num: any): boolean => {
    const parsed = parseInt(num);
    return !isNaN(parsed) && parsed >= 0 && parsed <= 2147483647;
};

/**
 * Sanitizeaza si valideaza input-ul pentru numele categoriilor/articolelor
 */
export const sanitizeAndValidateName = (name: string): string | null => {
    if (!validateStringLength(name, 2, 100)) {
        return null;
    }
    // Elimina spatiile multiple si sanitizeaza
    const sanitized = sanitizeHtml(name.trim().replace(/\s+/g, ' '));
    return sanitized;
};

/**
 * Valideaza parola - cel putin 6 caractere
 */
export const validatePassword = (password: string): boolean => {
    return !!(password && password.length >= 6 && password.length <= 128);
};
