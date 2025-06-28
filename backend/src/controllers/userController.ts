import { ServerResponse } from "http";
import pool from "../config/database";
import bcrypt from "bcrypt";
import { validateEmail, validatePassword, sanitizeAndValidateName } from "../utils/securityUtils";

export const registerUser = async (data: any, res: ServerResponse) => {
    const { username, email, password } = data;

    // Validari de securitate
    if (!validateEmail(email)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Email invalid" }));
        return;
    }

    if (!validatePassword(password)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Parola trebuie sa aiba intre 6-128 caractere" }));
        return;
    }

    const sanitizedUsername = sanitizeAndValidateName(username);
    if (!sanitizedUsername) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Numele de utilizator trebuie sa aiba intre 2-100 caractere" }));
        return;
    }

    const saltRounds = 10;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [sanitizedUsername, email.toLowerCase().trim(), hashedPassword]
        );
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.rows[0]));
    } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la inregistrare" }));
    }
};

export const loginUser = async (data: any, res: ServerResponse) => {
    const { email, password } = data;

    // Validari de securitate
    if (!validateEmail(email) || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Email sau parola invalide" }));
        return;
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    message: "Autentificare cu succes",
                    userId: user.id,
                    isAdmin: user.role === 'admin'
                }));
            } else {
                res.writeHead(401, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Email sau parola incorecta" }));
            }
        } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Utilizatorul nu a fost gasit" }));
        }
    } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la autentificare" }));
    }
};

// List all users (admin only)
export const listUsers = async (res: ServerResponse) => {
    try {
        const result = await pool.query('SELECT id, username, email, role FROM users ORDER BY id');
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.rows));
    } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la listarea utilizatorilor" }));
    }
};

// Promote user to admin (admin only)
export const promoteUser = async (data: any, res: ServerResponse) => {
    const { userId } = data;
    if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "ID utilizator lipsa" }));
        return;
    }
    try {
        await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', userId]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Utilizator promovat la admin" }));
    } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la promovare" }));
    }
};

// Delete user (admin only)
export const deleteUser = async (userId: number, res: ServerResponse) => {
    if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "ID utilizator lipsa" }));
        return;
    }
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Utilizator sters" }));
    } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la stergere" }));
    }
};
