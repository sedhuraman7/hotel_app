
import { sendEmail } from "../lib/mail";
import fs from "fs";
import path from "path";

// Manually load .env
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const val = valueParts.join('=').trim().replace(/^["']|["']$/g, ''); // Remove quotes
            if (!key.startsWith('#')) {
                process.env[key.trim()] = val;
            }
        }
    });
}
async function main() {
    const user = process.env.EMAIL_USER;
    if (!user) {
        console.error("❌ EMAIL_USER is not defined in environment variables. Keys found: ", Object.keys(process.env).filter(k => k.includes('EMAIL')));
        process.exit(1);
    }

    console.log(`📧 Attempting to send test email to: ${user}`);

    try {
        await sendEmail(user, "Hotel App: Configuration Test", "<h3>✅ Email System Working</h3><p>Your email credentials have been successfully updated and verified.</p>");
        console.log("✅ Check your inbox! If you see the email, everything is working.");
    } catch (error) {
        console.error("❌ Failed to send email:", error);
    }
}

main();
