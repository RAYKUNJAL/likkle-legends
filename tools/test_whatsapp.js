const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

async function testWhatsApp() {
    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: "whatsapp",
        to: process.env.WHATSAPP_TEST_NUMBER,
        type: "template",
        template: {
            name: "hello_world",
            language: {
                code: "en_US"
            }
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('WhatsApp API Response:', JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log('Test message sent successfully to ' + process.env.WHATSAPP_TEST_NUMBER);
        } else {
            console.error('Failed to send test message.');
        }
    } catch (err) {
        console.error('Error calling WhatsApp API:', err);
    }
}

testWhatsApp();
