import nodemailer from "nodemailer";

import fs from 'fs';
import path from 'path';

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        // Manually load .env to avoid server restart
        let user = process.env.EMAIL_USER;
        let pass = process.env.EMAIL_PASS;

        try {
            const envPath = path.resolve(process.cwd(), ".env");
            if (fs.existsSync(envPath)) {
                const envConfig = fs.readFileSync(envPath, 'utf8');
                const userMatch = envConfig.match(/EMAIL_USER=(.*)/);
                const passMatch = envConfig.match(/EMAIL_PASS=(.*)/);
                if (userMatch) user = userMatch[1].replace(/"/g, '').trim();
                if (passMatch) pass = passMatch[1].replace(/"/g, '').trim();
            }
        } catch (e) {
            console.error("Failed to manual load .env", e);
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: user,
                pass: pass
            },
            logger: true,
            debug: true
        });

        const mailOptions = {
            from: user,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent to:", to);
    } catch (error) {
        console.error("Email send failed:", error);
    }
};
