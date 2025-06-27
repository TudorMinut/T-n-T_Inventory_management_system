import * as nodemailer from 'nodemailer';

// Configurația transportorului de email
// Înlocuiește cu detaliile tale SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Trimite un email.
 * @param to - Adresa de email a destinatarului.
 * @param subject - Subiectul emailului.
 * @param text - Corpul emailului (text simplu).
 * @param html - Corpul emailului (HTML).
 */
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        const info = await transporter.sendMail({
            from: `"Manager de Stoc" <${process.env.SMTP_FROM_EMAIL}>`, // Adresa expeditorului
            to,
            subject,
            text,
            html,
        });

        console.log('Email trimis: %s', info.messageId);
        // Previzualizează emailul trimis (doar pentru Ethereal)
        // console.log('Previzualizează URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Eroare la trimiterea emailului:', error);
    }
};
