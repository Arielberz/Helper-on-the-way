require('dotenv').config();
const { sendEmail } = require('./api/utils/email');

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    
    try {
        await sendEmail({
            to: process.env.FROM_EMAIL, // Send to yourself for testing
            subject: 'Test Email - Verification System',
            text: 'Your verification code is: 123456',
            html: '<p>Your verification code is: <b>123456</b></p>'
        });
        console.log('✓ Email sent successfully!');
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
