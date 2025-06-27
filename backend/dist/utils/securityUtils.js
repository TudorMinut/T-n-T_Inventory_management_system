"use strict";
// Utilitare de securitate pentru prevenirea atacurilor XSS și validare input-uri
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.sanitizeAndValidateName = exports.validateNonNegativeInteger = exports.validatePositiveInteger = exports.validateStringLength = exports.validateEmail = exports.sanitizeHtml = void 0;
/**
 * Sanitizează un string pentru a preveni XSS
 * @param input - String-ul de sanitizat
 * @returns String sanitizat
 */
const sanitizeHtml = (input) => {
    if (!input)
        return '';
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};
exports.sanitizeHtml = sanitizeHtml;
/**
 * Validează un email
 * @param email - Email-ul de validat
 * @returns true dacă este valid
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
};
exports.validateEmail = validateEmail;
/**
 * Validează lungimea unui string
 * @param str - String-ul de validat
 * @param minLength - Lungimea minimă
 * @param maxLength - Lungimea maximă
 * @returns true dacă este valid
 */
const validateStringLength = (str, minLength = 1, maxLength = 255) => {
    return !!(str && str.trim().length >= minLength && str.trim().length <= maxLength);
};
exports.validateStringLength = validateStringLength;
/**
 * Validează un număr întreg pozitiv
 * @param num - Numărul de validat
 * @returns true dacă este valid
 */
const validatePositiveInteger = (num) => {
    const parsed = parseInt(num);
    return !isNaN(parsed) && parsed > 0 && parsed <= 2147483647; // Max PostgreSQL integer
};
exports.validatePositiveInteger = validatePositiveInteger;
/**
 * Validează un număr întreg non-negativ
 * @param num - Numărul de validat
 * @returns true dacă este valid
 */
const validateNonNegativeInteger = (num) => {
    const parsed = parseInt(num);
    return !isNaN(parsed) && parsed >= 0 && parsed <= 2147483647;
};
exports.validateNonNegativeInteger = validateNonNegativeInteger;
/**
 * Sanitizează și validează input-ul pentru numele categoriilor/articolelor
 * @param name - Numele de validat
 * @returns string sanitizat sau null dacă invalid
 */
const sanitizeAndValidateName = (name) => {
    if (!(0, exports.validateStringLength)(name, 2, 100)) {
        return null;
    }
    // Elimină spațiile multiple și sanitizează
    const sanitized = (0, exports.sanitizeHtml)(name.trim().replace(/\s+/g, ' '));
    return sanitized;
};
exports.sanitizeAndValidateName = sanitizeAndValidateName;
/**
 * Validează parola - cel puțin 6 caractere
 * @param password - Parola de validat
 * @returns true dacă este validă
 */
const validatePassword = (password) => {
    return !!(password && password.length >= 6 && password.length <= 128);
};
exports.validatePassword = validatePassword;
