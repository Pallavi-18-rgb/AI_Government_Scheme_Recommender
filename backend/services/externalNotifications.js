const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Initialize Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'mock_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'mock_token';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // or standard SMTP
    auth: {
        user: process.env.EMAIL_USER || 'govscheme.ai@gmail.com',
        pass: process.env.EMAIL_PASS || 'mock_password'
    }
});

const sendExternalNotifications = async (user, schemeName, type = 'recommendation') => {
    const isMock = process.env.TWILIO_ACCOUNT_SID === undefined;
    const message = `GovScheme AI: You have a new High Confidence Match for "${schemeName}". Log in to check your eligibility and missing documents.`;

    try {
        // 1. Send Email
        if (user.email) {
            if (!isMock) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'New High Confidence Government Scheme Match',
                    text: message
                });
            } else {
                console.log(`[MOCK EMAIL SENT to ${user.email}]: ${message}`);
            }
        }

        // 2. Send SMS
        const phone = user.phone || '+919876543210'; 
        if (!isMock) {
            const twilioClient = twilio(accountSid, authToken);
            await twilioClient.messages.create({
                body: message,
                from: twilioPhoneNumber,
                to: phone
            });
        } else {
            console.log(`[MOCK SMS SENT to ${phone}]: ${message}`);
        }

        // 3. Send WhatsApp
        if (!isMock) {
            const twilioClient = twilio(accountSid, authToken);
            await twilioClient.messages.create({
                body: message,
                from: twilioWhatsAppNumber,
                to: `whatsapp:${phone}`
            });
        } else {
            console.log(`[MOCK WHATSAPP SENT to whatsapp:${phone}]: ${message}`);
        }

        return true;
    } catch (error) {
        console.error('Error sending external notifications:', error);
        return false;
    }
};

module.exports = {
    sendExternalNotifications
};
