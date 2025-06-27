"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.promoteUser = exports.listUsers = exports.loginUser = exports.registerUser = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const securityUtils_1 = require("../utils/securityUtils");
const registerUser = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = data;
    // Validări de securitate
    if (!(0, securityUtils_1.validateEmail)(email)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Email invalid" }));
        return;
    }
    if (!(0, securityUtils_1.validatePassword)(password)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Parola trebuie să aibă între 6-128 caractere" }));
        return;
    }
    const sanitizedUsername = (0, securityUtils_1.sanitizeAndValidateName)(username);
    if (!sanitizedUsername) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Numele de utilizator trebuie să aibă între 2-100 caractere" }));
        return;
    }
    const saltRounds = 10;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const result = yield database_1.default.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email', [sanitizedUsername, email.toLowerCase().trim(), hashedPassword]);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.rows[0]));
    }
    catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la înregistrare" }));
    }
});
exports.registerUser = registerUser;
const loginUser = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = data;
    // Validări de securitate
    if (!(0, securityUtils_1.validateEmail)(email) || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Email sau parolă invalide" }));
        return;
    }
    try {
        const result = yield database_1.default.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = yield bcrypt_1.default.compare(password, user.password);
            if (match) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    message: "Autentificare cu succes",
                    userId: user.id,
                    isAdmin: user.role === 'admin'
                }));
            }
            else {
                res.writeHead(401, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Email sau parolă incorectă" }));
            }
        }
        else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Utilizatorul nu a fost găsit" }));
        }
    }
    catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la autentificare" }));
    }
});
exports.loginUser = loginUser;
// List all users (admin only)
const listUsers = (res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query('SELECT id, username, email, role FROM users ORDER BY id');
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.rows));
    }
    catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la listarea utilizatorilor" }));
    }
});
exports.listUsers = listUsers;
// Promote user to admin (admin only)
const promoteUser = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = data;
    if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "ID utilizator lipsă" }));
        return;
    }
    try {
        yield database_1.default.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', userId]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Utilizator promovat la admin" }));
    }
    catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la promovare" }));
    }
});
exports.promoteUser = promoteUser;
// Delete user (admin only)
const deleteUser = (userId, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "ID utilizator lipsă" }));
        return;
    }
    try {
        yield database_1.default.query('DELETE FROM users WHERE id = $1', [userId]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Utilizator șters" }));
    }
    catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la ștergere" }));
    }
});
exports.deleteUser = deleteUser;
