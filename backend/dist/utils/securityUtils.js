"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.sanitizeAndValidateName = exports.validateNonNegativeInteger = exports.validatePositiveInteger = exports.validateStringLength = exports.validateEmail = exports.sanitizeHtml = void 0;
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
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
};
exports.validateEmail = validateEmail;
const validateStringLength = (str, minLength = 1, maxLength = 255) => {
    return !!(str && str.trim().length >= minLength && str.trim().length <= maxLength);
};
exports.validateStringLength = validateStringLength;
const validatePositiveInteger = (num) => {
    const parsed = parseInt(num);
    return !isNaN(parsed) && parsed > 0 && parsed <= 2147483647;
};
exports.validatePositiveInteger = validatePositiveInteger;
const validateNonNegativeInteger = (num) => {
    const parsed = parseInt(num);
    return !isNaN(parsed) && parsed >= 0 && parsed <= 2147483647;
};
exports.validateNonNegativeInteger = validateNonNegativeInteger;
const sanitizeAndValidateName = (name) => {
    if (!(0, exports.validateStringLength)(name, 2, 100)) {
        return null;
    }
    const sanitized = (0, exports.sanitizeHtml)(name.trim().replace(/\s+/g, ' '));
    return sanitized;
};
exports.sanitizeAndValidateName = sanitizeAndValidateName;
const validatePassword = (password) => {
    return !!(password && password.length >= 6 && password.length <= 128);
};
exports.validatePassword = validatePassword;
