
import { sendEmail } from '../email';

const META_API_VERSION = 'v18.0';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export interface ExternalMessage {
    to: string; // email or phone
    subject?: string;
    body?: string;
    template?: string;
    templateData?: Record<string, any>;
    channel?: 'whatsapp' | 'email';
}

/**
 * Dispatches a message to the outside world via WhatsApp or Email.
 * Follows the strategy: WhatsApp for high-importance/OTP, Email for bulk/newsletters.
 */
export async function dispatchExternalMessage(msg: ExternalMessage) {
    const { to, subject, body, template, templateData, channel } = msg;

    // Detect channel if not provided
    const targetChannel = channel || (to.includes('@') ? 'email' : 'whatsapp');

    if (targetChannel === 'whatsapp' && PHONE_NUMBER_ID && WHATSAPP_ACCESS_TOKEN) {
        try {
            const response = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to,
                    type: template ? "template" : "text",
                    ...(template ? {
                        template: {
                            name: template,
                            language: { code: "en_US" },
                            // mapping components would go here for complex templates
                        }
                    } : {
                        text: { body: body || "" }
                    })
                })
            });

            return response.ok;
        } catch (err) {
            console.error("[MESSENGER] WhatsApp Failure:", err);
            // Fallback to email if user has one? (Needs more logic)
            return false;
        }
    }

    if (targetChannel === 'email') {
        const result = await sendEmail({
            to,
            subject: subject || "Likkle Legends Club",
            html: body || "Welcome back to the island!"
        });
        return result.success;
    }

    return false;
}
