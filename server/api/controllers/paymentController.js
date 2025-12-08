const Request = require('../models/requestsModel');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const sendResponse = require('../utils/sendResponse');

// PayPal API configuration
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';


// Get PayPal access token
async function getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
    
    console.log('PayPal Auth:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        clientIdLength: clientId?.length,
        clientSecretLength: clientSecret?.length,
        clientIdPreview: clientId?.substring(0, 10) + '...'
    });

    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
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
}

// Create PayPal order
exports.createOrder = async (req, res) => {
    try {
        const { requestId, amount, currency = 'ILS' } = req.body;
        const userId = req.userId;

        console.log('Create order request:', { 
            requestId, 
            amount, 
            currency, 
            userId,
            body: req.body 
        });

        if (!userId) {
            console.error('No userId found in request');
            return sendResponse(res, 401, false, "unauthorized");
        }

        if (!requestId || !amount || amount <= 0) {
            console.error('Invalid request data:', { requestId, amount });
            return sendResponse(res, 400, false, "requestId and valid amount are required");
        }

        // Verify the request exists and user is the requester
        const request = await Request.findById(requestId);
        if (!request) {
            return sendResponse(res, 404, false, "request not found");
        }

        if (request.user.toString() !== userId) {
            return sendResponse(res, 403, false, "not authorized to pay for this request");
        }

        if (!request.helper) {
            return sendResponse(res, 400, false, "no helper assigned to this request");
        }

        // Get PayPal access token
        let accessToken;
        try {
            accessToken = await getPayPalAccessToken();
        } catch (error) {
            console.error('Failed to get PayPal access token:', error);
            return sendResponse(res, 500, false, "PayPal authentication failed - please check credentials");
        }

        // Create order with PayPal
        const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'USD', // PayPal sandbox works best with USD
                        value: amount.toFixed(2)
                    },
                    description: `Payment for help request: ${request.problemType}`,
                    custom_id: requestId
                }],
                application_context: {
                    return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/paypal/success?requestId=${requestId}`,
                    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/paypal/cancel?requestId=${requestId}`,
                    brand_name: 'Helper On The Way',
                    user_action: 'PAY_NOW'
                }
            })
        });

        const orderData = await orderResponse.json();

        if (orderData.error) {
            console.error('PayPal error:', orderData);
            return sendResponse(res, 400, false, orderData.error_description || "PayPal error");
        }

        // Get approval URL
        const approvalUrl = orderData.links.find(link => link.rel === 'approve')?.href;

        if (!approvalUrl) {
            return sendResponse(res, 500, false, "failed to create PayPal order");
        }

        sendResponse(res, 200, true, "order created successfully", {
            orderId: orderData.id,
            approvalUrl
        });

    } catch (error) {
        console.error('Error creating PayPal order:', error);
        sendResponse(res, 500, false, "server error creating order");
    }
};

// Capture PayPal order (after user approves)
exports.captureOrder = async (req, res) => {
    try {
        const { orderId, requestId } = req.body;
        const userId = req.userId;

        console.log('Capture order request:', { orderId, requestId, userId });

        if (!userId) {
            console.error('No userId in request');
            return sendResponse(res, 401, false, "unauthorized");
        }

        if (!orderId || !requestId) {
            console.error('Missing orderId or requestId:', { orderId, requestId });
            return sendResponse(res, 400, false, "orderId and requestId are required");
        }

        // Verify the request
        const request = await Request.findById(requestId);
        if (!request) {
            return sendResponse(res, 404, false, "request not found");
        }

        if (request.user.toString() !== userId) {
            return sendResponse(res, 403, false, "not authorized");
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Capture the order
        const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const captureData = await captureResponse.json();

        if (captureData.status !== 'COMPLETED') {
            console.error('PayPal capture failed:', captureData);
            return sendResponse(res, 400, false, "payment capture failed");
        }

        // Payment successful - update database
        const capturedAmount = parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value);

        // Update request payment status
        request.payment = request.payment || {};
        request.payment.isPaid = true;
        request.payment.paidAt = Date.now();
        request.payment.paymentMethod = 'paypal';
        request.payment.offeredAmount = capturedAmount;
        request.payment.currency = captureData.purchase_units[0].payments.captures[0].amount.currency_code;
        
        // Mark request as completed if requester has confirmed
        if (request.requesterConfirmedAt) {
            request.status = 'completed';
            request.completedAt = Date.now();
            console.log(`✅ Request ${request._id} marked as completed after payment`);
        }
        
        await request.save();

        // Credit helper's wallet
        if (request.helper) {
            const helper = await User.findById(request.helper);
            if (helper) {
                const balanceBefore = helper.balance || 0;
                helper.balance = (helper.balance || 0) + capturedAmount;
                helper.totalEarnings = (helper.totalEarnings || 0) + capturedAmount;
                await helper.save();

                // Create transaction record
                await Transaction.create({
                    user: helper._id,
                    type: 'earning',
                    amount: capturedAmount,
                    balanceBefore,
                    balanceAfter: helper.balance,
                    currency: request.payment.currency,
                    description: `PayPal payment received for helping with ${request.problemType}`,
                    request: request._id,
                    status: 'completed'
                });

                console.log(`✅ PayPal payment captured: ${capturedAmount} credited to helper ${helper.username}'s wallet`);
            }
        }

        sendResponse(res, 200, true, "payment successful", {
            captureId: captureData.id,
            amount: capturedAmount,
            currency: request.payment.currency
        });

    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        sendResponse(res, 500, false, "server error capturing payment");
    }
};

// Pay with balance
exports.payWithBalance = async (req, res) => {
    let requesterBalanceReverted = false;
    let requester = null;
    let requesterBalanceBefore = 0;

    try {
        const { requestId } = req.body;
        const userId = req.userId;

        console.log('Starting balance payment:', { requestId, userId });

        if (!userId) {
            return sendResponse(res, 401, false, "unauthorized");
        }

        if (!requestId) {
            return sendResponse(res, 400, false, "requestId is required");
        }

        // Get the request
        const request = await Request.findById(requestId);
        if (!request) {
            return sendResponse(res, 404, false, "request not found");
        }

        if (request.user.toString() !== userId) {
            return sendResponse(res, 403, false, "not authorized to pay for this request");
        }

        if (!request.helper) {
            return sendResponse(res, 400, false, "no helper assigned to this request");
        }

        if (request.payment?.isPaid) {
            return sendResponse(res, 400, false, "payment already completed");
        }

        const amount = request.payment?.offeredAmount || 0;
        if (amount <= 0) {
            return sendResponse(res, 400, false, "invalid payment amount");
        }

        // Get requester
        requester = await User.findById(userId);
        if (!requester) {
            return sendResponse(res, 404, false, "user not found");
        }

        // Check if requester has enough balance
        if ((requester.balance || 0) < amount) {
            return sendResponse(res, 400, false, "insufficient balance");
        }

        // Deduct from requester's balance
        requesterBalanceBefore = requester.balance || 0;
        requester.balance -= amount;
        await requester.save();
        console.log('Deducted from requester balance');

        try {
            // Create deduction transaction for requester
            await Transaction.create({
                user: requester._id,
                type: 'payment',
                amount: -amount,
                balanceBefore: requesterBalanceBefore,
                balanceAfter: requester.balance,
                currency: request.payment?.currency || 'ILS',
                description: `Payment for help request: ${request.problemType}`,
                request: request._id,
                status: 'completed'
            });
            console.log('Created requester transaction');

            // Update request payment status
            request.payment = request.payment || {};
            request.payment.isPaid = true;
            request.payment.paidAt = Date.now();
            request.payment.paymentMethod = 'balance';
            
            // Mark request as completed if requester has confirmed
            if (request.requesterConfirmedAt) {
                request.status = 'completed';
                request.completedAt = Date.now();
                console.log(`✅ Request ${request._id} marked as completed after balance payment`);
            }
            
            await request.save();
            console.log('Updated request payment status');

            // Credit helper's wallet
            const helper = await User.findById(request.helper);
            if (helper) {
                const helperBalanceBefore = helper.balance || 0;
                helper.balance = (helper.balance || 0) + amount;
                helper.totalEarnings = (helper.totalEarnings || 0) + amount;
                await helper.save();
                console.log('Credited helper balance');

                // Create earning transaction for helper
                await Transaction.create({
                    user: helper._id,
                    type: 'earning',
                    amount: amount,
                    balanceBefore: helperBalanceBefore,
                    balanceAfter: helper.balance,
                    currency: request.payment?.currency || 'ILS',
                    description: `Payment received for helping with ${request.problemType}`,
                    request: request._id,
                    status: 'completed'
                });
                console.log('Created helper transaction');

                console.log(`✅ Balance payment: ${amount} transferred from ${requester.username} to ${helper.username}`);
            }

            sendResponse(res, 200, true, "payment successful", {
                amount,
                currency: request.payment?.currency || 'ILS',
                newBalance: requester.balance
            });

        } catch (innerError) {
            console.error('Error during payment processing, reverting requester balance:', innerError);
            // Revert requester balance
            requester.balance = requesterBalanceBefore;
            await requester.save();
            requesterBalanceReverted = true;
            throw innerError;
        }

    } catch (error) {
        console.error('Error processing balance payment:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        sendResponse(res, 500, false, "server error processing payment");
    }
};
