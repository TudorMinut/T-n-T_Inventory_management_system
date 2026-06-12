import * as nodemailer from "nodemailer";
import { env } from "../config/env";

const isEmailConfigured = () =>
    Boolean(env.email.host && env.email.user && env.email.password);

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        if (!isEmailConfigured()) {
            console.warn("SMTP is not configured. Skipping email delivery.");
            return;
        }

        const transporter = nodemailer.createTransport({
            host: env.email.host,
            port: env.email.port,
            auth: {
                user: env.email.user,
                pass: env.email.password,
            },
        });

        const info = await transporter.sendMail({
            from: env.email.from,
            to,
            subject,
            text,
            html,
        });

        console.log("Email trimis: %s", info.messageId);
    } catch (error) {
        console.error("Eroare la trimiterea emailului:", error);
    }
};
