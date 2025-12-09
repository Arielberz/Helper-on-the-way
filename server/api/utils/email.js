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
        // Create transporter using SendGrid SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });

        // Send email
        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to,
            subject,
            text,
            html
        });

        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = { sendEmail };
