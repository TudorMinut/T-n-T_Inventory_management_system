
import * as nodemailer from 'nodemailer';

// Configurația transportorului de email
// Înlocuiește cu detaliile tale SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'adolph.weber@ethereal.email',
        pass: 'gZTrsP9zN9sA5Yn4n2'
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
            from: '"Manager de Stoc" <no-reply@example.com>', // Adresa expeditorului
            to,
            subject,
            text,
            html,
        });

        console.log('Email trimis: %s', info.messageId);
        // Previzualizează emailul trimis (doar pentru Ethereal)
        console.log('Previzualizează URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Eroare la trimiterea emailului:', error);
    }
};
