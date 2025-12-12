const nodemailer = require('nodemailer');

/**
 * Send an email using SendGrid SMTP
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise} Resolves when email is sent
 */
async function sendEmail({ to, subject, text, html }) {
    try {
        // Log configuration for debugging (mask API key)
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.FROM_EMAIL;
        
        console.log('Email config check:', {
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey?.length || 0,
            apiKeyPrefix: apiKey?.substring(0, 5) || 'N/A',
            fromEmail: fromEmail || 'NOT SET',
            toEmail: to
        });

        if (!apiKey) {
            throw new Error('SENDGRID_API_KEY environment variable is not set');
        }
        if (!fromEmail) {
            throw new Error('FROM_EMAIL environment variable is not set');
        }

        // Create transporter using SendGrid SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: apiKey
            },
            // Add timeout settings for deployed environments
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 15000
        });

        // Verify SMTP connection before sending
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP connection verified successfully');

        // Send email
        const info = await transporter.sendMail({
            from: fromEmail,
            to,
            subject,
            text,
            html
        });

        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', {
            message: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        });
        throw error;
    }
}

module.exports = { sendEmail };
