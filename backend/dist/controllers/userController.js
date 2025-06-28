"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.promoteUser = exports.listUsers = exports.loginUser = exports.registerUser = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const securityUtils_1 = require("../utils/securityUtils");
const registerUser = async (data, res) => {
    const { username, email, password } = data;
    if (!(0, securityUtils_1.validateEmail)(email)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Email invalid" }));
        return;
    }
    if (!(0, securityUtils_1.validatePassword)(password)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Parola trebuie sa aiba intre 6-128 caractere" }));
        return;
    }
    const sanitizedUsername = (0, securityUtils_1.sanitizeAndValidateName)(username);
    if (!sanitizedUsername) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Numele de utilizator trebuie sa aiba intre 2-100 caractere" }));
        return;
    }
    const saltRounds = 10;
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        const result = await database_1.default.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email', [sanitizedUsername, email.toLowerCase().trim(), hashedPassword]);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.rows[0]));
    }
    catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la inregistrare" }));
    }
};
exports.registerUser = registerUser;
const loginUser = async (data, res) => {
    const { email, password } = data;
    if (!(0, securityUtils_1.validateEmail)(email) || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Email sau parola invalide" }));
        return;
    }
    try {
        const result = await database_1.default.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt_1.default.compare(password, user.password);
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
                res.end(JSON.stringify({ message: "Email sau parola incorecta" }));
            }
        }
        else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Utilizatorul nu a fost gasit" }));
        }
    }
    catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la autentificare" }));
    }
};
exports.loginUser = loginUser;
const listUsers = async (res) => {
    try {
        const result = await database_1.default.query('SELECT id, username, email, role FROM users ORDER BY id');
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.rows));
    }
    catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la listarea utilizatorilor" }));
    }
};
exports.listUsers = listUsers;
const promoteUser = async (data, res) => {
    const { userId } = data;
    if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "ID utilizator lipsa" }));
        return;
    }
    try {
        await database_1.default.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', userId]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Utilizator promovat la admin" }));
    }
    catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la promovare" }));
    }
};
exports.promoteUser = promoteUser;
const deleteUser = async (userId, res) => {
    if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "ID utilizator lipsa" }));
        return;
    }
    try {
        await database_1.default.query('DELETE FROM users WHERE id = $1', [userId]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Utilizator sters" }));
    }
    catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la stergere" }));
    }
};
exports.deleteUser = deleteUser;
