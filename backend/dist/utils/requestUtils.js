"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestBody = void 0;
const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('error', err => {
            reject(err);
        });
        req.on('end', () => {
            try {
                // Return an empty object if the body is empty, otherwise parse it
                resolve(body ? JSON.parse(body) : {});
            }
            catch (e) {
                reject(e);
            }
        });
    });
};
exports.getRequestBody = getRequestBody;
