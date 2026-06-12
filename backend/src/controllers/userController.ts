import { ServerResponse } from "http";
import pool from "../config/database";
import bcrypt from "bcrypt";
import { sendError, sendJson } from "../utils/responseUtils";

type UserPayload = {
    username?: string;
    email?: string;
    password?: string;
};

export const registerUser = async (data: UserPayload, res: ServerResponse) => {
    const { username, email, password } = data;
    const saltRounds = 10;

    if (!username?.trim() || !email?.trim() || !password || password.length < 8) {
        return sendError(res, 400, "Username, email si o parola de minim 8 caractere sunt obligatorii");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
            [username.trim(), email.trim().toLowerCase(), hashedPassword]
        );
        sendJson(res, 201, result.rows[0]);
    } catch (error) {
        sendError(res, 500, "Eroare la inregistrare");
    }
};

export const loginUser = async (data: UserPayload, res: ServerResponse) => {
    const { email, password } = data;

    if (!email?.trim() || !password) {
        return sendError(res, 400, "Email si parola sunt obligatorii");
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.trim().toLowerCase()]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                sendJson(res, 200, { message: "Autentificare cu succes", userId: user.id });
            } else {
                sendError(res, 401, "Email sau parola incorecta");
            }
        } else {
            sendError(res, 404, "Utilizatorul nu a fost gasit");
        }
    } catch (error) {
        sendError(res, 500, "Eroare la autentificare");
    }
};
