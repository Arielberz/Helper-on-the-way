const { agorotToIlsString, isValidAgorotAmount } = require('../utils/currencyConverter');

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

/**
 * Get PayPal OAuth access token
 */
async function getAccessToken() {
    try {
        const clientId = PAYPAL_CLIENT_ID?.trim();
        const clientSecret = PAYPAL_CLIENT_SECRET?.trim();
        
        if (!clientId || !clientSecret) {
            throw new Error('PayPal credentials not configured');
        }
        
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        
        const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        
        if (!response.ok || data.error) {
            console.error('PayPal authentication failed:', {
                status: response.status,
                error: data.error,
                error_description: data.error_description
            });
            throw new Error(data.error_description || 'PayPal authentication failed');
        }
        
        return data.access_token;
    } catch (error) {
        console.error('PayPal access token error:', error.message);
        throw new Error('Failed to get PayPal access token');
    }
}

/**
 * Create PayPal order with ILS currency
 * @param {number} amountAgorot - Amount in agorot (Israeli cents)
 * @param {string} requestId - Request ID for reference
 * @param {string} description - Payment description
 * @param {string} returnUrl - URL to return after payment approval
 * @param {string} cancelUrl - URL to return on payment cancellation
 * @returns {Promise<Object>} PayPal order object
 */
async function createPayPalOrder(amountAgorot, requestId, description = 'Helper on the Way Service', returnUrl, cancelUrl) {
    // Validate amount
    if (!isValidAgorotAmount(amountAgorot)) {
        throw new Error('Invalid payment amount');
    }

    if (amountAgorot === 0) {
        throw new Error('Cannot create PayPal order for zero amount');
    }

    // Convert to ILS string
    const ilsValue = agorotToIlsString(amountAgorot);

    try {
        const accessToken = await getAccessToken();
        
        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: requestId,
                description: description,
                amount: {
                    currency_code: 'ILS',  // ✅ Force ILS currency
                    value: ilsValue         // ✅ Use properly formatted ILS amount
                },
                custom_id: requestId
            }],
            application_context: {
                brand_name: 'Helper on the Way',
                locale: 'he-IL',
                landing_page: 'NO_PREFERENCE',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                return_url: returnUrl,
                cancel_url: cancelUrl
            }
        };

        console.log('🔵 Creating PayPal order:', {
            amount_agorot: amountAgorot,
            amount_ils: ilsValue,
            currency: 'ILS',
            request_id: requestId
        });

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (jsonError) {
            console.error('❌ Failed to parse PayPal response as JSON:', jsonError);
            throw new Error('Invalid PayPal API response');
        }

        console.log('🔵 PayPal raw response:', {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            data: responseData
        });

        if (!response.ok) {
            console.error('❌ PayPal order creation failed:', {
                status: response.status,
                statusText: response.statusText,
                error: responseData
            });
            throw new Error(responseData.message || responseData.error_description || `PayPal error: ${response.status}`);
        }

        console.log('✅ PayPal order created:', {
            order_id: responseData.id,
            status: responseData.status,
            hasLinks: !!responseData.links,
            linksCount: responseData.links?.length || 0
        });
        
        return responseData;
    } catch (error) {
        console.error('❌ PayPal order creation error:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        throw error;
    }
}

/**
 * Capture PayPal order payment
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<Object>} Capture result
 */
async function capturePayPalOrder(orderId) {
    try {
        const accessToken = await getAccessToken();
        
        console.log('🔵 Capturing PayPal order:', orderId);
        
        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ PayPal capture failed:', data);
            throw new Error(data.message || 'Failed to capture PayPal payment');
        }

        console.log('✅ PayPal order captured:', {
            order_id: orderId,
            status: data.status,
            currency: data.purchase_units[0]?.payments?.captures[0]?.amount?.currency_code,
            value: data.purchase_units[0]?.payments?.captures[0]?.amount?.value
        });
        
        return data;
    } catch (error) {
        console.error('PayPal capture error:', error.message);
        throw new Error('Failed to capture PayPal payment: ' + error.message);
    }
}

/**
 * Get PayPal order details
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<Object>} Order details
 */
async function getPayPalOrderDetails(orderId) {
    try {
        const accessToken = await getAccessToken();
        
        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Failed to get PayPal order details:', data);
            throw new Error(data.message || 'Failed to get PayPal order details');
        }

        return data;
    } catch (error) {
        console.error('PayPal order details error:', error.message);
        throw new Error('Failed to get PayPal order details: ' + error.message);
    }
}

module.exports = {
    createPayPalOrder,
    capturePayPalOrder,
    getPayPalOrderDetails
};
