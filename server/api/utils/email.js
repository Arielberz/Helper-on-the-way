const sgMail = require('@sendgrid/mail');

/**
 * Send an email using SendGrid HTTP API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise} Resolves when email is sent
 */
async function sendEmail({ to, subject, text, html }) {
    try {
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.FROM_EMAIL;

        console.log('Email config check:', {
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey?.length || 0,
            fromEmail: fromEmail || 'NOT SET',
            toEmail: to
        });

        if (!apiKey) {
            throw new Error('SENDGRID_API_KEY environment variable is not set');
        }
        if (!fromEmail) {
            throw new Error('FROM_EMAIL environment variable is not set');
        }

        // Set API key
        sgMail.setApiKey(apiKey);

        // Send email via HTTP API (works on Render and other cloud platforms)
        const msg = {
            to,
            from: fromEmail,
            subject,
            text,
            html
        };

        const response = await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid API:', response[0].statusCode);
        return response;
    } catch (error) {
        console.error('Error sending email:', {
            message: error.message,
            code: error.code,
            response: error.response?.body
        });
        throw error;
    }
}

module.exports = { sendEmail };
