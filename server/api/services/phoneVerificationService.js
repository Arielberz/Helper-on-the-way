/*
  קובץ זה אחראי על:
  - לוגיקה של אימות טלפון דרך Twilio Verify
  - שליחת OTP ל-SMS
  - ולידציה של קוד OTP
  - עדכון סטטוס phoneVerified של המשתמש

  הקובץ משמש את:
  - userController.js לנקודות קצה של אימות טלפון
  - requestsController.js לגירור אימות טלפון

  הקובץ אינו:
  - מטפל בבקשות HTTP - זה בקונטרולר
  - מגדיר סכימות - זה במודלים
*/

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

/**
 * Start phone verification by sending OTP to user's phone
 * @param {string} phone - User's phone number (E.164 format)
 * @returns {Promise<object>} - Response from Twilio Verify API
 */
async function startPhoneVerification(phone) {
  try {
    console.log('📱 [Phone Verification] Starting verification for phone:', phone?.substring(0, 5) + '...');
    
    if (!phone) {
      console.warn('⚠️ [Phone Verification] Phone number is required');
      throw {
        statusCode: 400,
        message: 'Phone number is required'
      };
    }

    // Validate phone format
    if (!phone.startsWith('+')) {
      console.warn('⚠️ [Phone Verification] Phone must be in E.164 format (e.g., +972XXXXXXXXX):', phone);
      throw {
        statusCode: 400,
        message: 'Phone must be in E.164 format (e.g., +972XXXXXXXXX)'
      };
    }

    // Check if Twilio is configured
    if (!accountSid || !authToken || !verifySid) {
      console.error('❌ [Phone Verification] Twilio not properly configured in .env');
      throw {
        statusCode: 500,
        message: 'Verification service not properly configured'
      };
    }

    console.log('📤 [Phone Verification] Sending SMS via Twilio...');
    const verification = await client.verify.v2
      .services(verifySid)
      .verifications.create({
        to: phone,
        channel: 'sms'
      });

    console.log('✅ [Phone Verification] SMS sent successfully:', {
      status: verification.status,
      sid: verification.sid?.substring(0, 10) + '...'
    });

    return {
      status: verification.status,
      sid: verification.sid
    };
  } catch (error) {
    console.error('❌ [Phone Verification] Error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      twilioCode: error.twilioCode
    });
    
    const message = error.message || 'Failed to start phone verification';
    const statusCode = error.statusCode || error.status || 400;
    
    throw {
      statusCode,
      message: message.includes('Invalid phone') ? 'Invalid phone number format' : message
    };
  }
}

/**
 * Check and verify the OTP code provided by user
 * @param {string} phone - User's phone number (E.164 format)
 * @param {string} code - OTP code provided by user
 * @returns {Promise<object>} - Verification result
 */
async function checkPhoneVerification(phone, code) {
  try {
    console.log('🔍 [Phone Verification] Checking code for phone:', phone?.substring(0, 5) + '...');
    
    if (!phone || !code) {
      console.warn('⚠️ [Phone Verification] Missing phone or code');
      throw {
        statusCode: 400,
        message: 'Phone number and verification code are required'
      };
    }

    // Check if Twilio is configured
    if (!accountSid || !authToken || !verifySid) {
      console.error('❌ [Phone Verification] Twilio not properly configured in .env');
      throw {
        statusCode: 500,
        message: 'Verification service not properly configured'
      };
    }

    console.log('🔐 [Phone Verification] Verifying code with Twilio...');
    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({
        to: phone,
        code: code
      });

    console.log('✅ [Phone Verification] Verification result:', {
      status: verificationCheck.status,
      valid: verificationCheck.status === 'approved'
    });

    if (verificationCheck.status !== 'approved') {
      console.warn('⚠️ [Phone Verification] Code not approved. Status:', verificationCheck.status);
      throw {
        statusCode: 400,
        message: 'Invalid or expired verification code'
      };
    }

    return {
      status: verificationCheck.status,
      verified: true
    };
  } catch (error) {
    console.error('❌ [Phone Verification] Error checking code:', {
      message: error.message,
      code: error.code,
      status: error.status,
      twilioCode: error.twilioCode
    });
    
    const message = error.message || 'Verification failed';
    const statusCode = error.statusCode || error.status || 400;
    
    throw {
      statusCode,
      message: message.includes('not found') ? 'Verification expired or invalid' : message
    };
  }
}

module.exports = {
  startPhoneVerification,
  checkPhoneVerification
};
