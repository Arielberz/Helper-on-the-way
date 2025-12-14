require('dotenv').config();
const { sendEmail } = require('./api/utils/email');

async function testEmail() {
    console.info('Testing email configuration...');
    console.info('FROM_EMAIL:', process.env.FROM_EMAIL);
    console.info('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    
    try {
        await sendEmail({
            to: process.env.FROM_EMAIL, // Send to yourself for testing
            subject: 'Test Email - Verification System',
            text: 'Your verification code is: 123456',
            html: '<p>Your verification code is: <b>123456</b></p>'
        });
        console.info('✓ Email sent successfully!');
        process.exit(0);
    } catch (error) {
        console.error('✗ Email sending failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.body);
        }
        process.exit(1);
    }
}

testEmail();
